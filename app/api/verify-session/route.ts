import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
})

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session_token')

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Decode session token
    const decoded = Buffer.from(sessionToken.value, 'base64').toString('utf-8')
    const [customerId] = decoded.split(':')

    if (!customerId) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Verify customer exists and has access code
    try {
      const customer = await stripe.customers.retrieve(customerId)
      
      if (customer.deleted || !customer.metadata?.accessCode) {
        return NextResponse.json(
          { authenticated: false },
          { status: 401 }
        )
      }

      // Verify payment
      const paymentIntentId = customer.metadata?.paymentIntentId
      if (paymentIntentId) {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
        if (paymentIntent.status !== 'succeeded') {
          return NextResponse.json(
            { authenticated: false },
            { status: 401 }
          )
        }
      }

      return NextResponse.json({
        authenticated: true,
        email: customer.email,
        customerId: customer.id,
      })
    } catch (err) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }
  } catch (error: any) {
    console.error('Error verifying session:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}

