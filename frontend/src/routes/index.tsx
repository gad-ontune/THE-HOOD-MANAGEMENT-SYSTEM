import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AdminLayout from '../layouts/AdminLayout'
import HomePage from '../features/home/HomePage'
import RoomsPage from '../features/home/RoomsPage'
import RestaurantPage from '../features/home/RestaurantPage'
import EventsPage from '../features/home/EventsPage'
import GalleryPage from '../features/home/GalleryPage'
import ContactPage from '../features/home/ContactPage'
import BookPage from '../features/home/BookPage'
import LoginPage from '../features/auth/pages/LoginPage'
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage'
import ChangePasswordPage from '../features/auth/pages/ChangePasswordPage'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import ReservationsPage from '../features/reservations/pages/ReservationsPage'
import GuestsPage from '../features/guests/pages/GuestsPage'
import RoomsAdminPage from '../features/rooms/pages/RoomsAdminPage'
import PaymentsPage from '../features/payments/pages/PaymentsPage'
import RestaurantAdminPage from '../features/restaurant/pages/RestaurantAdminPage'
import EventsAdminPage from '../features/restaurant/pages/EventsAdminPage'
import InventoryPage from '../features/inventory/pages/InventoryPage'
import HousekeepingPage from '../features/housekeeping/pages/HousekeepingPage'
import MaintenancePage from '../features/maintenance/pages/MaintenancePage'
import EmployeesPage from '../features/employees/pages/EmployeesPage'
import ReportsPage from '../features/reports/pages/ReportsPage'
import CmsPage from '../features/cms/pages/CmsPage'
import SettingsPage from '../features/settings/pages/SettingsPage'
import NotificationsPage from '../features/notifications/pages/NotificationsPage'
import NotFoundPage from '../features/home/NotFoundPage'

export default function AppRoutes({ onLogoClick }: { onLogoClick?: () => void }) {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout onLogoClick={onLogoClick} />}>
        <Route index element={<HomePage />} />
        <Route path="rooms" element={<RoomsPage />} />
        <Route path="restaurant" element={<RestaurantPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="book" element={<BookPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/admin/change-password" element={<ChangePasswordPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="guests" element={<GuestsPage />} />
        <Route path="rooms" element={<RoomsAdminPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="restaurant" element={<RestaurantAdminPage />} />
        <Route path="events" element={<EventsAdminPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="housekeeping" element={<HousekeepingPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="cms" element={<CmsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
