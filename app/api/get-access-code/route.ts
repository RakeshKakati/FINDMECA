import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
})

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { email, paymentIntentId } = await request.json()

    if (!email || !paymentIntentId) {
      return NextResponse.json(
        { error: 'Email and payment intent ID are required' },
        { status: 400 }
      )
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
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
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    const customer = customers.data[0]
    const accessCode = customer.metadata?.accessCode

    if (!accessCode) {
      return NextResponse.json(
        { error: 'Access code not found. Please contact support.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      accessCode,
    })
  } catch (error: any) {
    console.error('Error getting access code:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get access code' },
      { status: 500 }
    )
  }
}

