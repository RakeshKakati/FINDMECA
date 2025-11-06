import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { cookies } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
})

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email, accessCode } = await request.json()

    if (!email || !accessCode) {
      return NextResponse.json(
        { error: 'Email and access code are required' },
        { status: 400 }
      )
    }

    // Find customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    })

    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or access code' },
        { status: 401 }
      )
    }

    const customer = customers.data[0]
    const storedAccessCode = customer.metadata?.accessCode

    if (!storedAccessCode || storedAccessCode !== accessCode.toUpperCase()) {
      return NextResponse.json(
        { error: 'Invalid email or access code' },
        { status: 401 }
      )
    }

    // Verify customer has a successful payment
    const paymentIntentId = customer.metadata?.paymentIntentId
    if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 401 }
        )
      }
    }

    // Create session token (simple approach - in production, use JWT)
    const sessionToken = Buffer.from(`${customer.id}:${Date.now()}`).toString('base64')
    
    // Set httpOnly cookie
    const cookieStore = await cookies()
    cookieStore.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    return NextResponse.json({
      success: true,
      customerId: customer.id,
    })
  } catch (error: any) {
    console.error('Error during login:', error)
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    )
  }
}

