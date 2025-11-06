'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email')
  const paymentIntentId = searchParams.get('paymentIntentId')
  const [accessCode, setAccessCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check if payment was successful and get access code
    if (email && paymentIntentId) {
      fetch('/api/get-access-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          paymentIntentId,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.accessCode) {
            setAccessCode(data.accessCode)
          }
          setChecking(false)
        })
        .catch(() => {
          setChecking(false)
        })
    } else {
      setChecking(false)
    }
  }, [email, paymentIntentId])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          accessCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/dashboard')
      } else {
        setError(data.error || 'Invalid access code')
        setLoading(false)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Your payment has been processed successfully.</p>
          </div>

          {accessCode ? (
            <div className="mb-6">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Your Access Code:</p>
                <p className="text-2xl font-bold text-gray-900 font-mono">{accessCode}</p>
                <p className="text-xs text-gray-500 mt-2">Save this code! You'll need it to access your dashboard.</p>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                We've also sent this access code to <strong>{email}</strong>
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Your access code has been sent to <strong>{email}</strong>
              </p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="accessCode" className="block text-sm font-semibold text-gray-900 mb-2">
                Enter Access Code
              </label>
              <Input
                id="accessCode"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="Enter your access code"
                className="w-full text-center text-lg font-mono"
                maxLength={8}
                required
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading || !accessCode}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-base font-semibold rounded-md transition-all"
            >
              {loading ? 'Logging in...' : 'Access Dashboard'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <a href="/login" className="text-red-600 hover:text-red-700 font-semibold">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}

