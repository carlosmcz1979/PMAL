'use client'

import Link from 'next/link'
import { ShieldX, ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Número grande */}
      <div
        className="text-[8rem] font-black leading-none mb-2"
        style={{
          background: 'linear-gradient(135deg, var(--primary-400), var(--primary-700))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        404
      </div>

      {/* Ícone */}
      <div
        className="flex items-center justify-center rounded-2xl mb-6"
        style={{
          width: 64,
          height: 64,
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}
      >
        <ShieldX size={32} style={{ color: '#f87171' }} />
      </div>

      <h1
        className="text-2xl font-bold mb-2 text-center"
        style={{ color: 'var(--text-primary)' }}
      >
        Página não encontrada
      </h1>
      <p
        className="text-sm text-center mb-8 max-w-md"
        style={{ color: 'var(--text-muted)' }}
      >
        A página que você procura não existe ou foi movida.
        Verifique a URL ou volte para a página inicial.
      </p>

      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="btn-primary"
          style={{ textDecoration: 'none', padding: '0.75rem 1.5rem' }}
        >
          <Home size={16} />
          Ir para o Dashboard
        </Link>
        <button
          onClick={() => window.history.back()}
          className="btn-secondary"
          style={{ padding: '0.75rem 1.5rem', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
      </div>

      <p
        className="text-xs mt-12"
        style={{ color: 'var(--text-muted)', opacity: 0.5 }}
      >
        VISA Maceió — Vigilância Sanitária
      </p>
    </div>
  )
}
