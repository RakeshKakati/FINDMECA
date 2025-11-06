import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export const dynamic = 'force-dynamic'

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
    
    // Generate access code
    const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase()
    
    // Get or create customer
    let customerId = paymentIntent.customer as string | null
    
    if (!customerId && paymentIntent.metadata?.email) {
      // Find existing customer by email
      const customers = await stripe.customers.list({
        email: paymentIntent.metadata.email,
        limit: 1,
      })
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: paymentIntent.metadata.email,
        })
        customerId = customer.id
      }
    }
    
    // Store access code in customer metadata
    if (customerId) {
      await stripe.customers.update(customerId, {
        metadata: {
          accessCode: accessCode,
          paymentIntentId: paymentIntent.id,
          lastPaymentDate: new Date().toISOString(),
        },
      })
    }
    
    // TODO: Send email with access code (implement email service)
    console.log('Access code generated:', accessCode, 'for customer:', customerId)
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    console.log('Payment failed:', paymentIntent.id)
  }

  return NextResponse.json({ received: true })
}

