'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  LayoutDashboard,
  Building2,
  FileCheck,
  ClipboardCheck,
  BarChart3,
  ShieldCheck,
  LogOut,
  Activity,
  Plug,
  Users,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/estabelecimento/novo', label: 'Estabelecimentos', icon: Building2 },
  { href: '/licenca/gerenciar', label: 'Licenças', icon: FileCheck },
  { href: '/inspecao/nova', label: 'Inspeções', icon: ClipboardCheck },
  { href: '/relatorio', label: 'Relatórios', icon: BarChart3 },
  { href: '/integracoes', label: 'Integrações', icon: Plug },
  { href: '/admin', label: 'Administração', icon: ShieldCheck },
  { href: '/admin/usuarios', label: 'Usuários', icon: Users },
]

interface SidebarProps {
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) => {
    return pathname === href || (href !== '/admin' && href !== '/dashboard' && pathname.startsWith(href + '/'))
  }

  const handleClick = () => {
    if (onNavigate) onNavigate()
  }

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <Link href="/dashboard" className="flex items-center gap-3 no-underline" onClick={handleClick}>
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 44,
              height: 44,
              background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
              boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
            }}
          >
            <Activity size={24} color="white" />
          </div>
          <div>
            <h2
              className="text-base font-bold leading-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              VISA Maceió
            </h2>
            <p
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              Licenciamento Sanitário
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <div
          className="px-4 pb-2 text-xs font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          Menu Principal
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-link ${active ? 'active' : ''}`}
              onClick={handleClick}
            >
              <Icon size={20} className="nav-icon" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className="p-4"
        style={{ borderTop: '1px solid var(--border-default)' }}
      >
        <button
          onClick={handleLogout}
          className="sidebar-nav-link w-full"
          style={{
            color: 'var(--danger)',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: '0.75rem 1rem',
          }}
        >
          <LogOut size={20} className="nav-icon" />
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>
  )
}
