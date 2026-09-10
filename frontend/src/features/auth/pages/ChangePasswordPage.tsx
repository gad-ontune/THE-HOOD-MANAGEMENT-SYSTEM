import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import api from '@/services/api'

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, setUser, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      })
      if (user) {
        setUser({ ...user, mustChangePassword: false })
      }
      navigate('/admin')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password change failed')
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
        <form onSubmit={handleSubmit} className="bg-gradient-to-b from-surface to-[#081712] border border-[#20513F] rounded-[22px] p-8 space-y-5">
          <h2 className="text-xl xl:text-2xl font-heading font-semibold text-theme-text text-center mb-6">Change Your Password</h2>
          {error && <div className="p-3 rounded-[14px] bg-danger/10 border border-danger/30 text-danger text-sm text-center">{error}</div>}
          <p className="text-sm xl:text-base text-gold-500/80 text-center">
            You must set a new password before continuing. Default credentials cannot be used.
          </p>
          <Input label="Current Password" type="password" placeholder="Enter your current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          <Input label="New Password" type="password" placeholder="At least 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          <Input label="Confirm New Password" type="password" placeholder="Repeat new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          <Button variant="primary" className="w-full xl:text-lg" type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</Button>
          <div className="text-center pt-2">
            <button type="button" onClick={() => { logout(); navigate('/login') }} className="text-sm xl:text-base text-theme-text opacity-50 hover:text-gold-500 transition-colors">
              Sign out instead
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
