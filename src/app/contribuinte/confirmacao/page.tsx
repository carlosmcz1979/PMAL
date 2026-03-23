'use client'

import Link from 'next/link'
import { Activity, CheckCircle, ArrowRight } from 'lucide-react'

export default function ConfirmacaoContribuinte() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-md text-center animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-10">
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
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>VISA Maceió</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Portal do Contribuinte</p>
          </div>
        </div>

        {/* Ícone de sucesso */}
        <div
          className="flex items-center justify-center rounded-full mx-auto mb-6"
          style={{
            width: 96,
            height: 96,
            background: 'rgba(16, 185, 129, 0.15)',
            border: '3px solid rgba(16, 185, 129, 0.3)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          <CheckCircle size={48} style={{ color: 'var(--success)' }} />
        </div>

        <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Email confirmado!
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
          Sua conta foi ativada com sucesso.
          Agora você pode acessar o Portal do Contribuinte.
        </p>

        <Link
          href="/login"
          className="btn-primary inline-flex items-center gap-2"
          style={{ textDecoration: 'none', padding: '0.875rem 2rem', fontSize: '1rem' }}
        >
          Acessar o Portal
          <ArrowRight size={18} />
        </Link>

        <p className="text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
          Prefeitura Municipal de Maceió · Secretaria de Saúde
        </p>
      </div>
    </div>
  )
}
