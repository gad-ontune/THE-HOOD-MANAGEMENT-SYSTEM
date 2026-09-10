import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle, KeyRound } from 'lucide-react'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import api from '@/services/api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const submit = async () => {
    if (!password || password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired link.')
    }
    setLoading(false)
  }

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#1a1a1a] p-4">
      <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] p-8 w-full max-w-md text-center">
        <p className="text-white/50">Invalid reset link. No token provided.</p>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/login')}>Go to Login</Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#1a1a1a] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-gold-500">The Yads Hood Hotel</h1>
          <p className="text-white/50 text-sm mt-1">Staff Portal</p>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[22px] p-8 shadow-2xl">
          {!done ? (
            <>
              <div className="flex items-center justify-center mb-6">
                <KeyRound size={32} className="text-gold-500" />
              </div>
              <h2 className="text-xl font-heading font-bold text-white mb-2 text-center">Reset Password</h2>
              <p className="text-white/50 text-sm mb-6 text-center">Enter your new password.</p>

              {error && <p className="text-sm text-danger mb-4">{error}</p>}

              <Input label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" />
              <Input label="Confirm Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />

              <Button variant="primary" className="w-full mt-4" onClick={submit} disabled={loading || !password || !confirm}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h2 className="text-xl font-heading font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-white/50 text-sm mb-6">Your password has been updated successfully.</p>
              <Button variant="primary" className="w-full" onClick={() => navigate('/login')}>Go to Login</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
