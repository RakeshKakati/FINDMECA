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
    
    try {
      // Generate access code
      const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase()
      
      // Get or create customer
      let customerId = paymentIntent.customer as string | null
      let customerEmail = paymentIntent.metadata?.email || ''
      
      // If no customer ID, try to find or create by email
      if (!customerId) {
        if (customerEmail) {
          // Find existing customer by email
          const customers = await stripe.customers.list({
            email: customerEmail,
            limit: 1,
          })
          
          if (customers.data.length > 0) {
            customerId = customers.data[0].id
          } else {
            // Create new customer
            const customer = await stripe.customers.create({
              email: customerEmail,
            })
            customerId = customer.id
          }
        } else {
          // No email, create anonymous customer
          const customer = await stripe.customers.create({})
          customerId = customer.id
        }
      } else {
        // Get customer email if we have customer ID
        const customer = await stripe.customers.retrieve(customerId)
        if (typeof customer !== 'string' && !customer.deleted) {
          customerEmail = customer.email || customerEmail
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
        console.log('Access code generated and saved:', accessCode, 'for customer:', customerId, 'email:', customerEmail)
      } else {
        console.error('Failed to create or find customer for payment:', paymentIntent.id)
      }
    } catch (error: any) {
      console.error('Error processing payment_intent.succeeded:', error.message)
      // Don't fail the webhook, just log the error
    }
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    console.log('Payment failed:', paymentIntent.id)
  }

  return NextResponse.json({ received: true })
}

