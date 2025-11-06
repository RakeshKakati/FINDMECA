import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    console.log('Payment succeeded:', paymentIntent.id)
    // Here you could update a database, send confirmation emails, etc.
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    console.log('Payment failed:', paymentIntent.id)
  }

  return NextResponse.json({ received: true })
}

