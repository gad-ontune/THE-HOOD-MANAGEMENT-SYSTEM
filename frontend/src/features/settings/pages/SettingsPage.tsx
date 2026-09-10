import { useState } from 'react'
import { Card, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Hotel, CreditCard, Shield } from 'lucide-react'
import { showToast } from '@/lib/toast'

export default function SettingsPage() {
  const [savingHotel, setSavingHotel] = useState(false)
  const [savingPayment, setSavingPayment] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const saveHotel = async () => {
    setSavingHotel(true)
    await new Promise(r => setTimeout(r, 600))
    setSavingHotel(false)
    showToast('Hotel info saved', 'success')
  }

  const savePayment = async () => {
    setSavingPayment(true)
    await new Promise(r => setTimeout(r, 600))
    setSavingPayment(false)
    showToast('Payment settings saved', 'success')
  }

  const updatePassword = async () => {
    setSavingPassword(true)
    await new Promise(r => setTimeout(r, 600))
    setSavingPassword(false)
    showToast('Password updated', 'success')
  }

  return (
    <div className="page-container">
      <div><h1 className="text-3xl font-heading font-bold text-theme-text">Settings</h1><p className="text-theme-text opacity-50 mt-1">Configure hotel and system settings</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-3 mb-6"><Hotel size={24} className="text-gold-500" /><CardTitle>Hotel Information</CardTitle></div>
          <div className="space-y-4">
            <Input label="Hotel Name" defaultValue="The Yads Hood Hotel" />
            <Input label="Address" defaultValue="Kehancha, Migori County, Kenya" />
            <Input label="Phone" defaultValue="+254 757 915 384" />
            <Input label="Email" defaultValue="yadshoodhotel@gmail.com" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Check-in Time" defaultValue="2:00 PM" />
              <Input label="Check-out Time" defaultValue="11:00 AM" />
            </div>
            <Button variant="primary" onClick={saveHotel} disabled={savingHotel}>{savingHotel ? 'Saving...' : 'Save Hotel Info'}</Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6"><CreditCard size={24} className="text-gold-500" /><CardTitle>Payment Settings</CardTitle></div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-[14px] bg-theme-surface">
              <span className="text-theme-text">M-Pesa</span>
              <Badge variant="success">Active</Badge>
            </div>
            <Input label="Buy Goods Till Number" defaultValue="9217965" />
            <div className="flex items-center justify-between p-3 rounded-[14px] bg-theme-surface">
              <span className="text-theme-text">Card Payments</span>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-[14px] bg-theme-surface">
              <span className="text-theme-text">Cash Payments</span>
              <Badge variant="success">Active</Badge>
            </div>
            <Button variant="primary" onClick={savePayment} disabled={savingPayment}>{savingPayment ? 'Saving...' : 'Save Payment Settings'}</Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6"><Shield size={24} className="text-gold-500" /><CardTitle>Security</CardTitle></div>
          <div className="space-y-4">
            <Input label="Current Password" type="password" />
            <Input label="New Password" type="password" />
            <Input label="Confirm Password" type="password" />
            <Button variant="primary" onClick={updatePassword} disabled={savingPassword}>{savingPassword ? 'Updating...' : 'Update Password'}</Button>
            <div className="pt-4 border-t border-theme">
              <p className="text-sm text-theme-text opacity-50 mb-2">Session Timeout: <span className="text-theme-text">30 minutes</span></p>
              <p className="text-sm text-theme-text opacity-50">Last Password Change: <span className="text-theme-text">15 Jul 2026</span></p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
