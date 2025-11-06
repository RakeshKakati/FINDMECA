'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

interface TweetData {
  name: string
  handle: string
  avatar: string
  time: string
  text: string
}

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError(null)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setError('Card element not found')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1900, // $19 CAD
          email: email,
        }),
      })

      const { clientSecret, error: apiError } = await response.json()

      if (apiError) {
        setError(apiError)
        setLoading(false)
        return
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      )

      if (confirmError) {
        setError(confirmError.message || 'Payment failed')
        setLoading(false)
      } else if (paymentIntent?.status === 'succeeded') {
        // Redirect to success page with email
        window.location.href = `/payment-success?email=${encodeURIComponent(email)}&paymentIntentId=${paymentIntent.id}`
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-gray-900">Email Address</label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full"
        />
        <p className="text-xs text-gray-500">We'll send your access code to this email</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-900">Card Details</label>
        <div className="p-4 border-2 border-gray-200 rounded-lg focus-within:border-blue-500 transition-colors">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1a1a1a',
                  '::placeholder': {
                    color: '#999',
                  },
                },
                invalid: {
                  color: '#d32f2f',
                },
              },
            }}
          />
        </div>
      </div>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-black hover:bg-gray-900 text-white py-6 text-base font-semibold rounded-md transition-all"
        size="lg"
      >
        {loading ? 'Processing...' : 'Get Access for $19 CAD'}
      </Button>
    </form>
  )
}

function WhatsAppScreenshot({ messages, name, time }: { messages: string[], name: string, time: string }) {
  return (
    <div className="bg-[#e5ddd5] rounded-2xl overflow-hidden shadow-lg max-w-sm mx-auto">
      <div className="bg-[#075e54] px-4 py-3 flex items-center gap-3 text-white">
        <div className="w-10 h-10 rounded-full bg-[#25d366] flex items-center justify-center font-semibold text-lg">
          {name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="font-semibold">{name}</div>
          <div className="text-xs opacity-80">online</div>
        </div>
      </div>
      <div className="p-4 bg-[#ece5dd] min-h-[200px]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-3 flex flex-col ${idx % 2 === 0 ? 'items-start' : 'items-end'}`}>
            <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
              idx % 2 === 0 
                ? 'bg-white rounded-bl-sm' 
                : 'bg-[#dcf8c6] rounded-br-sm'
            }`}>
              {msg}
            </div>
            <div className="text-xs text-gray-600 mt-1 px-1">{time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Tweet({ name, handle, text, avatar, time }: TweetData) {
  return (
    <article className="hover:bg-white/5 transition-colors px-4 py-3">
      <div className="flex gap-3">
        {/* Profile Picture */}
        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
          {avatar}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Header with name, handle, verified checkmark, time, and more button */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-bold text-white text-[15px] leading-5">{name}</span>
              <svg viewBox="0 0 22 22" width="18.75" height="18.75" fill="#1d9bf0" className="ml-0.5">
                <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.136 1.896-.587.354-1.087.785-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.216.606-.266 1.263-.136 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.969-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
              </svg>
              <span className="text-[15px] leading-5 text-gray-500">@{handle}</span>
              <span className="text-[15px] leading-5 text-gray-500">·</span>
              <time className="text-[15px] leading-5 text-gray-500">{time}</time>
            </div>
            <button className="text-gray-500 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors">
              <svg viewBox="0 0 24 24" width="18.75" height="18.75" fill="currentColor">
                <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"></path>
              </svg>
            </button>
          </div>
          
          {/* Tweet Text */}
          <div className="text-white text-[15px] leading-5 mb-3 whitespace-pre-wrap break-words">{text}</div>
          
          {/* Engagement Icons */}
          <div className="flex items-center justify-between max-w-[425px] mt-3">
            {/* Reply */}
            <button className="flex items-center gap-2 text-gray-500 hover:text-[#1d9bf0] transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                <svg viewBox="0 0 24 24" width="18.75" height="18.75" fill="currentColor">
                  <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.15 6.138 6.23l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path>
                </svg>
              </div>
              <span className="text-[13px]">12</span>
            </button>
            
            {/* Retweet */}
            <button className="flex items-center gap-2 text-gray-500 hover:text-[#00ba7c] transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-[#00ba7c]/10 transition-colors">
                <svg viewBox="0 0 24 24" width="18.75" height="18.75" fill="currentColor">
                  <path d="M4.75 3.79l4.603 4.3-1.706 1.82L6 8.38v7.37c0 .97.784 1.75 1.75 1.75H13V20H7.75c-2.347 0-4.25-1.9-4.25-4.25V8.38L1.853 9.91.147 8.09l4.603-4.3zm11.5 4.71H11V4h5.25c2.347 0 4.25 1.9 4.25 4.25v7.37l1.647-1.53 1.706 1.82-4.603 4.3-4.603-4.3 1.706-1.82L18 16.13V8.75c0-.97-.784-1.75-1.75-1.75z"></path>
                </svg>
              </div>
              <span className="text-[13px]">47</span>
            </button>
            
            {/* Like */}
            <button className="flex items-center gap-2 text-gray-500 hover:text-[#f91880] transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-[#f91880]/10 transition-colors">
                <svg viewBox="0 0 24 24" width="18.75" height="18.75" fill="currentColor">
                  <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path>
                </svg>
              </div>
              <span className="text-[13px]">234</span>
            </button>
            
            {/* Analytics */}
            <button className="flex items-center gap-2 text-gray-500 hover:text-[#1d9bf0] transition-colors group">
              <div className="p-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                <svg viewBox="0 0 24 24" width="18.75" height="18.75" fill="currentColor">
                  <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path>
                </svg>
              </div>
              <span className="text-[13px]">1.2K</span>
            </button>
            
            {/* Bookmark */}
            <button className="text-gray-500 hover:text-[#1d9bf0] transition-colors p-2 rounded-full hover:bg-[#1d9bf0]/10">
              <svg viewBox="0 0 24 24" width="18.75" height="18.75" fill="currentColor">
                <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v19.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v17.06l6.5-4.64 6.5 4.64V4.5c0-.28-.224-.5-.5-.5h-11z"></path>
              </svg>
            </button>
            
            {/* Share */}
            <button className="text-gray-500 hover:text-[#1d9bf0] transition-colors p-2 rounded-full hover:bg-[#1d9bf0]/10">
              <svg viewBox="0 0 24 24" width="18.75" height="18.75" fill="currentColor">
                <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41L7.71 9.71 6.29 8.29 12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function TweetSlider({ tweets }: { tweets: TweetData[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tweets.length)
    }, 5000) // Change tweet every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, tweets.length])

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + tweets.length) % tweets.length)
    setIsAutoPlaying(false)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tweets.length)
    setIsAutoPlaying(false)
  }

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {tweets.map((tweet, index) => (
            <div key={index} className="min-w-full flex-shrink-0">
              <Tweet {...tweet} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {tweets.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-red-600'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
        aria-label="Previous tweet"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-gray-700">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
        aria-label="Next tweet"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-gray-700">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </button>
    </div>
  )
}

const canadianCities = [
  'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg',
  'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Halifax', 'Victoria', 'Saskatoon',
  'Regina', 'St. John\'s', 'Barrie', 'Kelowna', 'Abbotsford', 'Sudbury', 'Kingston',
  'Saguenay', 'Trois-Rivières', 'Guelph', 'Cambridge', 'Coquitlam', 'Richmond', 'Ajax',
  'Burlington', 'Oshawa', 'St. Catharines', 'Longueuil', 'Laval', 'Surrey', 'Burnaby',
  'Brampton', 'Mississauga', 'Markham', 'Windsor', 'Thunder Bay', 'Red Deer', 'Nanaimo'
]

const firstNames = [
  'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Ashley', 'Daniel',
  'Amanda', 'Christopher', 'Jennifer', 'Matthew', 'Nicole', 'Andrew', 'Michelle',
  'Joshua', 'Stephanie', 'Ryan', 'Lauren', 'Justin', 'Megan', 'Brandon', 'Rachel',
  'Tyler', 'Samantha', 'Kevin', 'Lisa', 'Brian', 'Kimberly', 'Jason', 'Amy', 'Eric',
  'Angela', 'Jonathan', 'Melissa', 'Steven', 'Heather', 'Thomas', 'Rebecca', 'Timothy'
]

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris',
  'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott',
  'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker'
]

function SignupNotification() {
  const [notification, setNotification] = useState<{ name: string; city: string; savings: number } | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const generateNotification = () => {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const city = canadianCities[Math.floor(Math.random() * canadianCities.length)]
      const savings = Math.floor(Math.random() * 5000) + 500 // Random between $500 and $5500

      return {
        name: `${firstName} ${lastName}`,
        city,
        savings
      }
    }

    // Show first notification after 3 seconds
    const initialTimeout = setTimeout(() => {
      setNotification(generateNotification())
      setIsVisible(true)
    }, 3000)

    // Then show new notifications every 8-15 seconds
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setNotification(generateNotification())
        setIsVisible(true)
      }, 300) // Wait for fade out
    }, 8000 + Math.random() * 7000) // Random between 8-15 seconds

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [])

  if (!notification) return null

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 transition-all duration-500 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      <div className="bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-3 sm:p-4 max-w-xs sm:max-w-sm animate-slide-in">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              <span className="font-bold">{notification.name}</span> from <span className="font-bold">{notification.city}</span> just signed up
            </p>
            <p className="text-sm text-gray-600 mt-1">
              and saved <span className="font-bold text-green-600">${notification.savings.toLocaleString('en-CA')} CAD</span>
            </p>
            <p className="text-xs text-gray-400 mt-2">Just now</p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function SavingsCalculator() {
  const [currentRate, setCurrentRate] = useState('')
  const [hoursPerYear, setHoursPerYear] = useState('')
  const [savingsPercentage, setSavingsPercentage] = useState(25)

  const calculateSavings = () => {
    const rate = parseFloat(currentRate) || 0
    const hours = parseFloat(hoursPerYear) || 0
    const currentCost = rate * hours
    const savings = currentCost * (savingsPercentage / 100)
    const newCost = currentCost - savings
    
    return {
      currentCost,
      savings,
      newCost,
      hasValues: rate > 0 && hours > 0
    }
  }

  const result = calculateSavings()

  return (
    <div className="max-w-4xl mx-auto">
      {/* Input Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Current Rate */}
        <div className="space-y-3">
          <label htmlFor="current-rate" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Current CPA Hourly Rate
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-lg z-10">$</div>
            <Input
              id="current-rate"
              type="number"
              min="0"
              step="10"
              value={currentRate}
              onChange={(e) => setCurrentRate(e.target.value)}
              placeholder="200"
              className="pl-10 pr-4 py-6 text-xl font-semibold text-black bg-white border-2 border-gray-200 focus:border-black focus:ring-0 rounded-xl transition-all"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">CAD</div>
          </div>
        </div>
        
        {/* Hours per Year */}
        <div className="space-y-3">
          <label htmlFor="hours" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Hours per Year
          </label>
          <Input
            id="hours"
            type="number"
            min="0"
            step="1"
            value={hoursPerYear}
            onChange={(e) => setHoursPerYear(e.target.value)}
            placeholder="40"
            className="px-4 py-6 text-xl font-semibold text-black bg-white border-2 border-gray-200 focus:border-black focus:ring-0 rounded-xl transition-all"
          />
        </div>
      </div>

      {/* Savings Percentage Slider */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <label htmlFor="savings" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Average Savings Percentage
          </label>
          <div className="px-5 py-2 bg-black text-white rounded-full font-bold text-lg min-w-[80px] text-center">
            {savingsPercentage}%
          </div>
        </div>
        <div className="relative">
          <input
            id="savings"
            type="range"
            min="10"
            max="40"
            step="5"
            value={savingsPercentage}
            onChange={(e) => setSavingsPercentage(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer savings-slider"
            style={{
              background: `linear-gradient(to right, #000 0%, #000 ${((savingsPercentage - 10) / 30) * 100}%, #e5e7eb ${((savingsPercentage - 10) / 30) * 100}%, #e5e7eb 100%)`
            }}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>10%</span>
            <span>40%</span>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result.hasValues ? (
        <div className="mt-10 space-y-6">
          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Current Annual Cost</div>
              <div className="text-4xl font-bold text-gray-600">
                ${result.currentCost.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">New Annual Cost</div>
              <div className="text-4xl font-bold text-black">
                ${result.newCost.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Savings Highlight */}
          <div className="bg-gradient-to-br from-black to-gray-900 rounded-2xl p-8 text-white text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
            <div className="relative z-10">
              <div className="text-sm font-semibold uppercase tracking-wider mb-3 text-white/80">You Could Save</div>
              <div className="text-6xl font-bold mb-2">
                ${result.savings.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-lg text-white/70">per year</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-10 text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">💰</div>
          <p className="text-base text-gray-500 font-medium">Enter your current CPA rate and hours to see potential savings</p>
        </div>
      )}
    </div>
  )
}

export default function LandingPage() {
  const [stripeReady, setStripeReady] = useState(false)

  useEffect(() => {
    if (stripePromise) {
      setStripeReady(true)
    }
  }, [])

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "CPA Canada Directory",
    "description": "Find and compare CPA accountants across Canada. Save money on accounting fees with our comprehensive directory.",
    "provider": {
      "@type": "Organization",
      "name": "CPA Canada Directory"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Canada"
    },
    "offers": {
      "@type": "Offer",
      "price": "19",
      "priceCurrency": "CAD",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": "19",
        "priceCurrency": "CAD"
      }
    }
  }

  if (!stripeReady) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gray-900 text-white py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Find the Perfect CPA</h1>
            <div className="mt-8 p-6 bg-white text-red-600 rounded-lg max-w-md mx-auto">
              <strong>Configuration Required:</strong>
              <p className="mt-2 text-sm">
                Please set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in your .env.local file
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SignupNotification />
      <div className="min-h-screen bg-white">
        {/* Navigation Header - Uber Style */}
        <nav className="bg-black sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="black" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xl font-semibold text-white">findmeca</span>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <a href="#calculator" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                  Calculator
                </a>
                <a href="#pricing" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                  Pricing
                </a>
                <a href="/login" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                  Login
                </a>
              </div>
              <div className="flex items-center gap-4">
                <a href="/login" className="text-white/80 hover:text-white transition-colors text-sm font-medium md:hidden">
                  Login
                </a>
                <a href="#pricing" className="bg-white text-black px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors">
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - Uber Style Dark */}
        <header className="bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-4xl mx-auto text-center py-24 sm:py-32 lg:py-40">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight tracking-tight">
                Find the Best CPA Accountants in Canada
              </h1>
              <p className="text-xl sm:text-2xl text-white/70 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
                Compare rates, read reviews, and save thousands on accounting fees. Access Canada's most comprehensive directory of verified CPA firms.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <a href="#pricing" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-md text-base font-semibold hover:bg-gray-100 transition-all transform hover:scale-105">
                    Get Started
                  </button>
                </a>
                <a href="#calculator" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-md text-base font-semibold hover:border-white/50 hover:bg-white/5 transition-all">
                    Calculate Savings
                  </button>
                </a>
              </div>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 pt-8 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Verified Directory</span>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Trusted by 10,000+</span>
                </div>
                {/* Trustpilot Badge */}
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0L8.4 7.2H0l6.6 4.8L3 19.2l9-6.6 9 6.6-3.6-7.2L24 7.2h-8.4L12 0z"/>
                  </svg>
                  <span>Trustpilot</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Section - Hero Style */}
        <section className="py-16 sm:py-20 bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold mb-2">500+</div>
                <div className="text-sm sm:text-base text-white/70">CPA Firms</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold mb-2">10K+</div>
                <div className="text-sm sm:text-base text-white/70">Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold mb-2">$2M+</div>
                <div className="text-sm sm:text-base text-white/70">Saved</div>
              </div>
              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-bold mb-2">4.8★</div>
                <div className="text-sm sm:text-base text-white/70">Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Savings Calculator - Hero Style */}
        <section id="calculator" className="py-20 sm:py-24 lg:py-32 bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
                Calculate Your Potential Savings
              </h2>
              <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
                See how much you could save by finding the right CPA accountant
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-6 sm:p-8">
                <SavingsCalculator />
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof - WhatsApp - Hero Style */}
        <section className="py-20 sm:py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4 sm:mb-6 tracking-tight">
                See How We Help People Save Money
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">Real conversations from our community</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto">
              <WhatsAppScreenshot
                name="Sarah Chen"
                time="2:34 PM"
                messages={[
                  "Just used the CPA directory to find a new accountant",
                  "Saved me $2,400 this year! The old firm was overcharging me",
                  "Best $19 I ever spent 🎉"
                ]}
              />
              <WhatsAppScreenshot
                name="Mike Thompson"
                time="11:22 AM"
                messages={[
                  "Found a CPA through your directory",
                  "They helped me restructure my business and save $5,000 in taxes",
                  "Wish I found this sooner!"
                ]}
              />
              <WhatsAppScreenshot
                name="Emily Rodriguez"
                time="4:15 PM"
                messages={[
                  "The directory saved me so much time",
                  "Compared 10+ firms in one place",
                  "Found someone who saved me $1,800 vs my old accountant"
                ]}
              />
            </div>
          </div>
        </section>

        {/* Twitter Testimonials - Exact Twitter Design as Cards */}
        <section className="py-20 sm:py-24 lg:py-32 bg-black">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
                What People Are Saying
              </h2>
              <p className="text-lg sm:text-xl text-white/70">Real testimonials from our community</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
              {[
                {
                  name: "Alex Kumar",
                  handle: "alexkumar",
                  avatar: "AK",
                  time: "2h",
                  text: "Found an amazing CPA through @CPACanadaDir. They helped me save $3,200 on my taxes this year. The directory made it so easy to compare options. Worth every penny! 💰"
                },
                {
                  name: "Jessica Park",
                  handle: "jesspark",
                  avatar: "JP",
                  time: "5h",
                  text: "As a small business owner, finding the right accountant was overwhelming. This directory saved me hours of research and $4,500 in fees. Highly recommend! 🚀"
                },
                {
                  name: "David Wilson",
                  handle: "dwilson",
                  avatar: "DW",
                  time: "1d",
                  text: "Switched to a CPA I found on the directory. They're more affordable AND better than my old one. Saved $2,100 this year. Best investment I made! 📊"
                },
                {
                  name: "Maria Santos",
                  handle: "mariasantos",
                  avatar: "MS",
                  time: "2d",
                  text: "The reviews and ratings helped me find a CPA who specializes in my industry. They saved me $6,000 by finding deductions I didn't know about. Game changer! ✨"
                },
                {
                  name: "Chris Anderson",
                  handle: "chrisand",
                  avatar: "CA",
                  time: "3d",
                  text: "Used to pay $500/hour for tax advice. Found someone through the directory charging $200/hour with better service. Saved thousands! This platform is gold 🏆"
                },
                {
                  name: "Lisa Chen",
                  handle: "lisachen",
                  avatar: "LC",
                  time: "4d",
                  text: "The directory helped me find a CPA who understands cross-border taxes. Saved me $5,400 and so much stress. Can't recommend enough! 🌟"
                }
              ].map((tweet, index) => (
                <div key={index} className="bg-black border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
                  <Tweet {...tweet} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section - Redesigned */}
        <section className="py-20 sm:py-24 lg:py-32 bg-gray-50 pb-32 sm:pb-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4 sm:mb-6 tracking-tight">
                Why Choose findmeca
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">Everything you need to find the perfect CPA</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-3xl">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Complete Directory</h3>
                <p className="text-gray-600 leading-relaxed">Access hundreds of verified CPA firms across Canada with detailed information and contact details.</p>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-3xl">⭐</span>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Real Reviews</h3>
                <p className="text-gray-600 leading-relaxed">Read authentic reviews and ratings from real clients to make informed decisions.</p>
              </div>
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-2xl font-bold text-black mb-4">Save Money</h3>
                <p className="text-gray-600 leading-relaxed">Compare rates and find accountants that fit your budget. Save thousands on accounting fees.</p>
              </div>
            </div>

            {/* Trust Logos Section */}
            <div className="border-t border-gray-200 pt-12">
              <p className="text-center text-gray-500 text-sm mb-8 uppercase tracking-wider font-semibold">Trusted By</p>
              <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
                {/* Trustpilot Badge */}
                <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-lg border border-gray-200 hover:shadow-md transition-all">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0L8.4 7.2H0l6.6 4.8L3 19.2l9-6.6 9 6.6-3.6-7.2L24 7.2h-8.4L12 0z" fill="#00B67A"/>
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-gray-700 font-semibold text-sm">Trustpilot</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-600">4.8</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Stripe Logo */}
                <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-lg border border-gray-200 hover:shadow-md transition-all">
                  <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                  <span className="text-gray-700 font-semibold">Stripe</span>
                </div>
                {/* SSL Badge */}
                <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-lg border border-gray-200 hover:shadow-md transition-all">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="#10b981"/>
                    <path d="M12 11.99V8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M12 16v-2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="text-gray-700 font-semibold">SSL Secure</span>
                </div>
                {/* Money Back */}
                <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-lg border border-gray-200 hover:shadow-md transition-all">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2" fill="none"/>
                    <path d="M12 8v8M8 12h8" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <span className="text-gray-700 font-semibold">30-Day Guarantee</span>
                </div>
                {/* Verified */}
                <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-lg border border-gray-200 hover:shadow-md transition-all">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12l2 2 4-4" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="#3b82f6" strokeWidth="2" fill="none"/>
                  </svg>
                  <span className="text-gray-700 font-semibold">Verified</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section - Hero Style */}
        <section id="pricing" className="py-20 sm:py-24 lg:py-32 bg-black text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-90"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">Get Full Access Today</h2>
              <p className="text-lg sm:text-xl text-white/70">One-time payment. Lifetime access.</p>
            </div>
            <div className="max-w-lg mx-auto">
              <Card className="bg-white border-2 border-white/20 shadow-2xl relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-2 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
                <CardHeader className="text-center pt-10 pb-8">
                  <div className="mb-8">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-2xl text-gray-400 line-through">$49</span>
                      <span className="text-sm text-red-600 font-semibold bg-red-50 px-2 py-1 rounded">Save 61%</span>
                    </div>
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl text-gray-400">$</span>
                      <span className="text-7xl font-bold text-black ml-1">19</span>
                      <span className="text-2xl text-gray-400 ml-2">CAD</span>
                    </div>
                  </div>
                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    Get instant access to the complete CPA directory. Compare firms, read reviews, and find the accountant that saves you money.
                  </p>
                  <ul className="text-left space-y-4 mb-8 max-w-sm mx-auto">
                    <li className="flex items-start gap-3 text-gray-700">
                      <span className="text-black font-bold text-lg mt-0.5">✓</span>
                      <span className="text-base">Full directory access</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700">
                      <span className="text-black font-bold text-lg mt-0.5">✓</span>
                      <span className="text-base">Contact information</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700">
                      <span className="text-black font-bold text-lg mt-0.5">✓</span>
                      <span className="text-base">Reviews & ratings</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700">
                      <span className="text-black font-bold text-lg mt-0.5">✓</span>
                      <span className="text-base">Search & filter tools</span>
                    </li>
                    <li className="flex items-start gap-3 text-gray-700">
                      <span className="text-black font-bold text-lg mt-0.5">✓</span>
                      <span className="text-base">Lifetime updates</span>
                    </li>
                  </ul>
                  
                  {/* Security Badges */}
                  <div className="flex flex-wrap justify-center gap-4 mb-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span>Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>30-Day Guarantee</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>Trusted</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-8">
                  <Elements stripe={stripePromise}>
                    <CheckoutForm />
                  </Elements>
                  
                  {/* Payment Logos */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-center text-xs text-gray-500 mb-3">Secure payment powered by</p>
                    <div className="flex justify-center items-center gap-3">
                      <div className="text-gray-400 text-xs font-semibold">Stripe</div>
                      <div className="w-px h-4 bg-gray-300"></div>
                      <svg className="w-12 h-4" viewBox="0 0 60 20" fill="none">
                        <rect width="60" height="20" rx="2" fill="#635BFF"/>
                        <text x="30" y="12" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">STRIPE</text>
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 sm:py-24 lg:py-32 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4 sm:mb-6 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-lg sm:text-xl text-gray-600">Everything you need to know about finding the right CPA</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              <details className="group bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all">
                <summary className="flex items-center justify-between cursor-pointer">
                  <h3 className="text-xl font-bold text-gray-900 pr-8">Find the Best CPA Accountants Across Canada</h3>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    Looking for a certified public accountant (CPA) in Canada? Our comprehensive directory helps you find and compare CPA firms across all major cities including Toronto, Vancouver, Montreal, Calgary, Edmonton, and more. Whether you need tax preparation, business accounting, or financial consulting services, our platform makes it easy to find qualified CPAs near you.
                  </p>
                </div>
              </details>

              <details className="group bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all">
                <summary className="flex items-center justify-between cursor-pointer">
                  <h3 className="text-xl font-bold text-gray-900 pr-8">Why Use Our CPA Directory?</h3>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    Finding the right CPA accountant can save you thousands of dollars in accounting fees and help you maximize your tax savings. Our directory includes verified CPA firms with real customer reviews, ratings, and contact information. Compare hourly rates, read authentic reviews, and find accountants that specialize in your industry or tax situation.
                  </p>
                </div>
              </details>

              <details className="group bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all">
                <summary className="flex items-center justify-between cursor-pointer">
                  <h3 className="text-xl font-bold text-gray-900 pr-8">Search CPA Firms by Location</h3>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    Our directory covers CPA firms in major Canadian cities including Toronto, Vancouver, Montreal, Calgary, Edmonton, Ottawa, Winnipeg, Hamilton, Kitchener, London, Victoria, Halifax, Saskatoon, Regina, and many more. Each listing includes the firm's address, phone number, website, and customer ratings to help you make an informed decision.
                  </p>
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* Footer with SEO Links - Uber Style */}
        <footer className="bg-black text-white py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main Footer Content */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 md:gap-12 mb-12 pb-12 border-b border-white/10">
              {/* For Customers */}
              <div>
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/90">For Customers</h3>
                <ul className="space-y-3 text-sm text-white/70">
                  <li><a href="#pricing" className="hover:text-white transition-colors">Find a Professional</a></li>
                  <li><a href="#calculator" className="hover:text-white transition-colors">How it works</a></li>
                  <li><a href="/dashboard" className="hover:text-white transition-colors">Login</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Mobile App</a></li>
                </ul>
              </div>

              {/* For Professionals */}
              <div>
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/90">For Professionals</h3>
                <ul className="space-y-3 text-sm text-white/70">
                  <li><a href="#pricing" className="hover:text-white transition-colors">How it works</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Join as a Professional</a></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">Help centre</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Mobile App</a></li>
                </ul>
              </div>

              {/* About */}
              <div>
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/90">About</h3>
                <ul className="space-y-3 text-sm text-white/70">
                  <li><a href="#faq" className="hover:text-white transition-colors">About findmeca</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Press</a></li>
                </ul>
              </div>

              {/* Need help? */}
              <div>
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-white/90">Need help?</h3>
                <ul className="space-y-3 text-sm text-white/70">
                  <li><a href="#faq" className="hover:text-white transition-colors">Contact Support</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-6 text-sm uppercase tracking-wider text-white/90">CPA in Alberta</h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Calgary</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Edmonton</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Red Deer</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Lethbridge</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in St. Albert</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Medicine Hat</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Grande Prairie</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Airdrie</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Spruce Grove</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Fort McMurray</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Leduc</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Okotoks</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Fort Saskatchewan</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Chestermere</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-6 text-sm uppercase tracking-wider text-white/90">CPA in British Columbia</h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Vancouver</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Surrey</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Burnaby</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Richmond</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Victoria</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Abbotsford</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Coquitlam</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Kelowna</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Langley</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Nanaimo</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Kamloops</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Prince George</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Chilliwack</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Maple Ridge</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in New Westminster</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-6 text-sm uppercase tracking-wider text-white/90">CPA in Ontario</h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Toronto</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Ottawa</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Mississauga</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Hamilton</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in London</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Brampton</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Markham</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Vaughan</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Kitchener</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Windsor</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Richmond Hill</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Oakville</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Burlington</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Oshawa</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in St. Catharines</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Cambridge</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Guelph</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Barrie</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Ajax</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Whitby</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Thunder Bay</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Sudbury</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-6 text-sm uppercase tracking-wider text-white/90">CPA in Quebec</h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Montreal</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Quebec City</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Laval</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Gatineau</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Longueuil</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Sherbrooke</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Saguenay</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Lévis</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Trois-Rivières</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Terrebonne</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Brossard</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Repentigny</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-6 text-sm uppercase tracking-wider text-white/90">Other Provinces</h3>
                <ul className="space-y-2 text-sm text-white/80">
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Winnipeg</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Saskatoon</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Regina</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Halifax</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in St. John's</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Charlottetown</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Brandon</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Moncton</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Fredericton</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Whitehorse</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">CPA in Yellowknife</a></li>
                </ul>
              </div>
            </div>
            {/* Social Media & Bottom Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/10">
              {/* Social Media Icons */}
              <div className="flex items-center gap-4">
                <a href="#" className="text-white/70 hover:text-white transition-colors" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" className="text-white/70 hover:text-white transition-colors" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-white/70 hover:text-white transition-colors" aria-label="LinkedIn">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>

              {/* Location & Copyright */}
              <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>Canada</span>
                </div>
                <div className="hidden md:block">•</div>
                <div className="flex items-center gap-2">
                  <span>&copy; 2025 findmeca Global Limited.</span>
                </div>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center items-center gap-4 pt-6 text-xs text-white/50">
              <a href="#" className="hover:text-white transition-colors">Terms & Conditions</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Cookie policy</a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">Privacy policy</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
