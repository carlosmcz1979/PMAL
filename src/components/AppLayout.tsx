'use client'

import { useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import { Menu, X } from 'lucide-react'

interface AppLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  actions?: ReactNode
}

export default function AppLayout({ children, title, subtitle, actions }: AppLayoutProps) {
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: 'var(--bg-base)' }}
      >
        <div
          className="animate-pulse-glow rounded-full"
          style={{
            width: 56,
            height: 56,
            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
          }}
        />
      </div>
    )
  }

  return (
    <>
      {/* Sidebar overlay for mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar with mobile toggle class */}
      <div className={sidebarOpen ? 'sidebar-mobile-open' : ''}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Hamburger button for mobile */}
      <button
        className="hamburger-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Menu"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <main className="main-content animate-fade-in">
        <div className="page-header">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>
            {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
          </div>
        </div>
        <div className="page-content">{children}</div>
      </main>
    </>
  )
}
