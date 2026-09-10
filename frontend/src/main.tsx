import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AppRoutes from './routes'
import { ThemeProvider } from '@/components/ThemeProvider'
import WelcomeStatic from '@/components/WelcomeStatic'
import { useUIStore } from '@/store/uiStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
    },
  },
})

function Root() {
  const { showIntro, startIntro } = useUIStore()

  useEffect(() => {
    const introSeen = localStorage.getItem('introSeen') === 'true'
    if (!introSeen && !showIntro) {
      startIntro()
    }
  }, [startIntro, showIntro])

  const handleLogoClick = () => {
    startIntro()
  }

  const handleIntroFinish = () => {
    localStorage.setItem('introSeen', 'true')
    useUIStore.setState({ showIntro: false })
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <AppRoutes onLogoClick={handleLogoClick} />
            {showIntro && <WelcomeStatic onFinish={handleIntroFinish} />}
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
