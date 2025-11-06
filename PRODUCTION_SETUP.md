# Production Setup Guide - Live Stripe Keys

## Important Notes Before Going Live

⚠️ **Before switching to live keys, ensure:**
- Your Stripe account is fully activated and verified
- You've tested thoroughly with test keys
- You understand Stripe's pricing and fee structure
- You have proper error handling and logging in place

## Setting Up Live Stripe Keys

### Step 1: Get Your Live Stripe Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. **Toggle to Live Mode** (switch in the top right corner - this is critical!)
3. Navigate to **Developers → API keys**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`) - Click "Reveal" to see it

### Step 2: Set Up Production Webhook

1. In Live Mode, go to **Developers → Webhooks**
2. Click **"Add endpoint"**
3. Enter your production webhook URL:
   ```
   https://yourdomain.com/api/webhook
   ```
4. Select the events to listen to:
   - `payment_intent.succeeded` (required)
   - `payment_intent.payment_failed` (recommended)
   - `payment_intent.canceled` (optional)
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)

### Step 3: Update Environment Variables

Update your `.env.local` file (or production environment variables) with live keys:

```env
# Live Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET

# Production URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 4: Deploy to Production

#### For Vercel:
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add each variable:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...`
   - `NEXT_PUBLIC_APP_URL` = `https://yourdomain.com`
4. Redeploy your application

#### For Other Platforms:
- Add the environment variables through your hosting platform's dashboard
- Ensure `NEXT_PUBLIC_*` variables are available at build time
- Restart your application after adding variables

### Step 5: Update Webhook URL in Stripe

After deploying, update your webhook endpoint URL in Stripe Dashboard to match your production domain:
```
https://yourdomain.com/api/webhook
```

### Step 6: Test with Real Payment

⚠️ **Use a real card with a small amount first!**

1. Make a test payment with a real card
2. Check Stripe Dashboard → Payments to verify it appears
3. Check your webhook logs in Stripe Dashboard → Developers → Webhooks
4. Verify the payment flow works end-to-end

## Security Best Practices

1. **Never commit live keys to Git**
   - `.env.local` should be in `.gitignore` (already configured)
   - Never share live secret keys

2. **Use different keys for different environments**
   - Test keys for development
   - Live keys only for production

3. **Rotate keys if compromised**
   - If you suspect a key is compromised, regenerate it immediately in Stripe Dashboard
   - Update all environments using that key

4. **Monitor your Stripe Dashboard**
   - Set up email alerts for failed payments
   - Monitor webhook delivery status
   - Review payment activity regularly

## Troubleshooting

### Payment Intent Creation Fails
- Verify `STRIPE_SECRET_KEY` is set correctly
- Check that you're using live keys in production (not test keys)
- Ensure your Stripe account is activated

### Webhook Not Receiving Events
- Verify webhook URL is correct and accessible
- Check webhook signing secret matches
- Review webhook delivery logs in Stripe Dashboard
- Ensure your server can receive POST requests from Stripe

### "Configuration Required" Message Shows
- Check that `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Verify the key starts with `pk_live_` (not `pk_test_`)
- Restart your application after adding environment variables

## Stripe Dashboard Links

- [Stripe Dashboard](https://dashboard.stripe.com)
- [API Keys](https://dashboard.stripe.com/apikeys)
- [Webhooks](https://dashboard.stripe.com/webhooks)
- [Payments](https://dashboard.stripe.com/payments)
- [Settings](https://dashboard.stripe.com/settings)

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)

