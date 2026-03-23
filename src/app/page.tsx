'use client'

import { Activity, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-default)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-xl" style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))' }}>
            <Activity size={22} color="white" />
          </div>
          <div>
            <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>VISA Maceió</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Vigilância Sanitária</p>
          </div>
        </div>
        <Link href="/login" className="btn-primary text-sm" style={{ textDecoration: 'none', padding: '0.5rem 1.25rem' }}>
          Acessar Sistema
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div
          className="flex items-center justify-center rounded-2xl mb-8"
          style={{
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
            boxShadow: '0 8px 32px rgba(20, 184, 166, 0.3)',
          }}
        >
          <Shield size={40} color="white" />
        </div>

        <h2
          className="text-4xl sm:text-5xl font-black mb-4"
          style={{ color: 'var(--text-primary)', lineHeight: 1.1 }}
        >
          Sistema de Licenciamento{' '}
          <span style={{ color: 'var(--primary-400)' }}>Sanitário</span>
        </h2>

        <p
          className="text-base sm:text-lg mb-10 max-w-xl"
          style={{ color: 'var(--text-secondary)' }}
        >
          Plataforma integrada de gestão de licenciamento, fiscalização e controle sanitário da Prefeitura Municipal de Maceió.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="btn-primary"
            style={{ textDecoration: 'none', padding: '0.875rem 2rem', fontSize: '1rem' }}
          >
            <Shield size={18} />
            Portal do Servidor
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/contribuinte/registro"
            className="btn-secondary"
            style={{ textDecoration: 'none', padding: '0.875rem 2rem', fontSize: '1rem' }}
          >
            Portal do Contribuinte
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 mb-8">
          {[
            { label: 'Estabelecimentos', value: '2.500+' },
            { label: 'Licenças Emitidas', value: '1.800+' },
            { label: 'Inspeções/Ano', value: '3.200+' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--primary-400)' }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center" style={{ borderTop: '1px solid var(--border-default)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          © 2026 Prefeitura Municipal de Maceió — Secretaria de Saúde · Vigilância Sanitária
        </p>
      </footer>
    </div>
  )
}
