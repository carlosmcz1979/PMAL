'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity, LogIn, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      {/* Left Side — Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--primary-950) 0%, var(--primary-800) 50%, var(--primary-700) 100%)',
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-20 -left-20 rounded-full opacity-10"
          style={{ width: 400, height: 400, background: 'var(--primary-400)' }}
        />
        <div
          className="absolute -bottom-32 -right-32 rounded-full opacity-10"
          style={{ width: 500, height: 500, background: 'var(--primary-300)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-5"
          style={{ width: 300, height: 300, background: 'white' }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 animate-fade-in">
          <div
            className="flex items-center justify-center rounded-xl"
            style={{
              width: 52,
              height: 52,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Activity size={28} color="white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">VISA Maceió</h2>
            <p className="text-sm text-teal-200 opacity-80">
              Vigilância Sanitária
            </p>
          </div>
        </div>

        {/* Center text */}
        <div className="relative z-10 animate-slide-in-up">
          <h1
            className="text-4xl font-extrabold text-white leading-tight mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            Sistema de
            <br />
            Licenciamento
            <br />
            <span className="text-teal-300">Sanitário</span>
          </h1>
          <p className="text-teal-100 text-lg max-w-md opacity-80 leading-relaxed">
            Plataforma integrada de gestão de licenciamento, fiscalização
            e controle sanitário da Secretaria Municipal de Saúde de Maceió.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-teal-200 text-sm opacity-60">
            Prefeitura Municipal de Maceió · Secretaria de Saúde
          </p>
        </div>
      </div>

      {/* Right Side — Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: 44,
                height: 44,
                background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
              }}
            >
              <Activity size={24} color="white" />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                VISA Maceió
              </h2>
            </div>
          </div>

          <div className="glass-card-static p-8">
            <div className="text-center mb-8">
              <h1
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Bem-vindo de volta
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                Entre com suas credenciais para acessar o sistema
              </p>
            </div>

            {error && (
              <div
                className="p-3 rounded-lg mb-4 text-sm font-medium"
                style={{
                  background: 'var(--danger-light)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="input-label">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-premium"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <label className="input-label">Senha</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-premium"
                    style={{ paddingRight: '3rem' }}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    style={{
                      color: 'var(--text-muted)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
                style={{ padding: '0.875rem 1.5rem' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </span>
                ) : (
                  <>
                    <LogIn size={18} />
                    Entrar
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6 space-y-2">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Servidor público?{' '}
                <Link href="/register" className="font-semibold hover:underline" style={{ color: 'var(--primary-400)' }}>
                  Registre-se aqui
                </Link>
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Contribuinte?{' '}
                <Link href="/contribuinte/registro" className="font-semibold hover:underline" style={{ color: 'var(--primary-400)' }}>
                  Crie sua conta
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
