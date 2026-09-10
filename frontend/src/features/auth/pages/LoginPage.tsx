import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import api from '@/services/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('accessToken', res.data.accessToken)
      setUser(res.data.user)
      navigate(res.data.user?.mustChangePassword ? '/admin/change-password' : '/admin')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-forest-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md xl:max-w-xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl xl:text-4xl font-heading font-bold text-gold-500">The Yads Hood Hotel</h1>
          <p className="text-theme-text opacity-50 mt-2 xl:text-lg">Staff Login Portal</p>
        </div>
        <form onSubmit={handleLogin} className="bg-gradient-to-b from-surface to-[#081712] border border-[#20513F] rounded-[22px] p-8 space-y-5">
          <h2 className="text-xl xl:text-2xl font-heading font-semibold text-theme-text text-center mb-6">Sign In</h2>
          {error && <div className="p-3 rounded-[14px] bg-danger/10 border border-danger/30 text-danger text-sm text-center">{error}</div>}
          <Input label="Email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button variant="primary" className="w-full xl:text-lg" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
          <div className="text-center pt-2 space-y-2">
            <Link to="/forgot-password" className="block text-sm xl:text-base text-gold-500/70 hover:text-gold-500 transition-colors">Forgot Password?</Link>
            <a href="/" className="text-sm xl:text-base text-theme-text opacity-50 hover:text-gold-500 hover:opacity-100 transition-all duration-300">Back to Website →</a>
          </div>
        </form>
      </div>
    </div>
  )
}
