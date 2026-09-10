import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import api from '@/services/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!email) return
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch {
      setError('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#1a1a1a] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-gold-500">The Yads Hood Hotel</h1>
          <p className="text-white/50 text-sm mt-1">Staff Portal</p>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] p-8 shadow-2xl">
          {!sent ? (
            <>
              <h2 className="text-xl font-heading font-bold text-white mb-2">Forgot Password</h2>
              <p className="text-white/50 text-sm mb-6">Enter your email and we'll send a reset link.</p>

              {error && <p className="text-sm text-danger mb-4">{error}</p>}

              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@yadshoodhotel.com" />

              <Button variant="primary" className="w-full mt-4" onClick={submit} disabled={loading || !email}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h2 className="text-xl font-heading font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-white/50 text-sm mb-2">If <strong className="text-white">{email}</strong> is registered, you'll receive a password reset link shortly.</p>
              <p className="text-white/30 text-xs">Check your spam folder if you don't see it.</p>
            </div>
          )}

          <Link to="/login" className="flex items-center justify-center gap-2 mt-6 text-white/40 hover:text-white/70 text-sm transition-colors">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
