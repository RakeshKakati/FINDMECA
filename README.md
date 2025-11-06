# CPA Canada Platform

A simple platform with a landing page and dashboard for accessing CPA firm data across Canada. The platform includes Stripe payment integration to control access to the dashboard.

## Features

- **Landing Page**: Beautiful landing page with Stripe payment integration
- **Dashboard**: Displays comprehensive CPA firm data from CSV file
- **Payment Protection**: Dashboard access is restricted to users who have completed payment
- **Search & Filter**: Search functionality to find specific CPA firms
- **Pagination**: Efficient pagination for large datasets

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Stripe

1. Create a Stripe account at [https://stripe.com](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Set Up Stripe Webhook (Optional but Recommended)

For production, you should set up a webhook endpoint:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook signing secret to your `.env.local` file

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
CPACANADA/
├── app/
│   ├── api/
│   │   ├── data/              # API endpoint for CSV data
│   │   ├── create-payment-intent/  # Stripe payment intent creation
│   │   └── webhook/           # Stripe webhook handler
│   ├── dashboard/             # Dashboard page
│   ├── globals.css            # Global styles
│   ├── landing.css            # Landing page styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Landing page
├── data.csv                   # CPA firm data
├── package.json
└── README.md
```

## How It Works

1. **Landing Page**: Users see the landing page with payment form
2. **Payment**: Users enter card details and complete payment via Stripe
3. **Access Control**: Payment completion is stored in sessionStorage
4. **Dashboard**: Only users with completed payment can access the dashboard
5. **Data Display**: Dashboard shows all CPA firm data with search and pagination

## Payment Flow

- User enters card details on landing page
- Payment intent is created via `/api/create-payment-intent`
- Payment is confirmed using Stripe.js
- On success, `paymentCompleted` flag is set in sessionStorage
- User is redirected to dashboard
- Dashboard checks for `paymentCompleted` flag before displaying data

## Notes

- The current implementation uses sessionStorage for payment verification
- For production, you should implement proper backend authentication and database storage
- The CSV data is parsed and served via the `/api/data` endpoint
- Payment amount is set to $0.50 CAD (50 cents) - you can modify this in `app/page.tsx`

## Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Make sure to set up all required environment variables in `.env.local`:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret (for production)
- `NEXT_PUBLIC_APP_URL`: Your application URL

## License

MIT

