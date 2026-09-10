import { Link } from 'react-router-dom'
import Button from '@/components/ui/button'

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <h1 className="text-8xl font-heading font-bold text-gold-500 mb-6">404</h1>
        <h2 className="text-3xl font-heading font-bold text-theme-text mb-4">Oops! Page Not Found</h2>
        <p className="text-theme-text opacity-60 mb-8">We couldn't find the page you're looking for. It might have been moved or deleted.</p>
        <Link to="/"><Button variant="primary" size="lg">Return Home</Button></Link>
      </div>
    </div>
  )
}
