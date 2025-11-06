# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env.local` file in the root directory with the following:

### For Development (Test Mode):
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### For Production (Live Mode):
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret_here
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Getting Stripe Keys:

#### Test Keys (Development):
1. Go to [https://stripe.com](https://stripe.com) and create an account
2. Navigate to Developers → API keys
3. Make sure you're in **Test mode** (toggle in the top right)
4. Copy your **Publishable key** (starts with `pk_test_`)
5. Copy your **Secret key** (starts with `sk_test_`)
6. For webhooks (optional for development):
   - Go to Developers → Webhooks
   - Add endpoint: `http://localhost:3000/api/webhook` (use Stripe CLI for local testing)
   - Copy the webhook signing secret

#### Live Keys (Production):
1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. **IMPORTANT**: Toggle to **Live mode** (switch in the top right of the Stripe Dashboard)
3. Navigate to Developers → API keys
4. Copy your **Live Publishable key** (starts with `pk_live_`)
5. Copy your **Live Secret key** (starts with `sk_live_`)
6. For production webhooks:
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Enter your production webhook URL: `https://yourdomain.com/api/webhook`
   - Select the events you want to listen to (at minimum: `payment_intent.succeeded` and `payment_intent.payment_failed`)
   - Copy the webhook signing secret (starts with `whsec_`)

### For Local Webhook Testing:

Install Stripe CLI and run:
```bash
stripe listen --forward-to localhost:3000/api/webhook
```

This will give you a webhook secret starting with `whsec_`

## Step 3: Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing Payments

Use Stripe test card numbers:
- Success: `4242 4242 4242 4242`
- Any future expiry date (e.g., 12/34)
- Any 3-digit CVC
- Any postal code

## Troubleshooting

- **"Configuration Required" message**: Make sure `.env.local` exists and has the correct keys
- **Payment fails**: Check that `STRIPE_SECRET_KEY` is set correctly
- **Data not loading**: Ensure `data.csv` exists in the root directory

