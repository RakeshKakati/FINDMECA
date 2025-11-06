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
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    if (accessCode) {
      navigator.clipboard.writeText(accessCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  useEffect(() => {
    // Check if payment was successful and get access code
    if (email && paymentIntentId) {
      // Retry logic: try multiple times in case webhook is still processing
      let retries = 0
      const maxRetries = 5
      const retryDelay = 2000 // 2 seconds
      
      const fetchAccessCode = () => {
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
              setChecking(false)
            } else if (retries < maxRetries) {
              // Retry if access code not found yet
              retries++
              setTimeout(fetchAccessCode, retryDelay)
            } else {
              // Max retries reached, show error
              setError('Access code is being generated. Please wait a moment and refresh the page.')
              setChecking(false)
            }
          })
          .catch((err) => {
            if (retries < maxRetries) {
              retries++
              setTimeout(fetchAccessCode, retryDelay)
            } else {
              setError('Failed to retrieve access code. Please contact support.')
              setChecking(false)
            }
          })
      }
      
      // Start fetching
      fetchAccessCode()
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
              <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-6 mb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">Your Access Code</p>
                </div>
                <div className="relative inline-block mb-3">
                  <p className="text-4xl font-bold text-red-900 font-mono tracking-wider">{accessCode}</p>
                  <button
                    onClick={copyToClipboard}
                    className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="bg-white rounded-lg p-3 border border-red-200">
                  <p className="text-sm font-semibold text-red-800 mb-1">⚠️ IMPORTANT: Save This Code!</p>
                  <p className="text-xs text-red-700">You'll need this code to log in and access your dashboard. Click the copy button above or take a screenshot.</p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Save this code in a safe place. You can use it anytime at <a href="/login" className="underline font-semibold">findmeca.com/login</a>
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>Processing your access code...</strong>
                </p>
                <p className="text-xs text-yellow-700">Please wait a moment while we generate your access code.</p>
              </div>
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

