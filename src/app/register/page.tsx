'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity, UserPlus, Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Senhas não conferem')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    }

    setLoading(false)
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
        <div
          className="absolute -top-20 -left-20 rounded-full opacity-10"
          style={{ width: 400, height: 400, background: 'var(--primary-400)' }}
        />
        <div
          className="absolute -bottom-32 -right-32 rounded-full opacity-10"
          style={{ width: 500, height: 500, background: 'var(--primary-300)' }}
        />

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
            <p className="text-sm text-teal-200 opacity-80">Vigilância Sanitária</p>
          </div>
        </div>

        <div className="relative z-10 animate-slide-in-up">
          <h1
            className="text-4xl font-extrabold text-white leading-tight mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            Crie sua
            <br />
            <span className="text-teal-300">conta</span>
          </h1>
          <p className="text-teal-100 text-lg max-w-md opacity-80 leading-relaxed">
            Registre-se para acessar o sistema de licenciamento sanitário
            e gerenciar seus estabelecimentos.
          </p>
        </div>

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
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              VISA Maceió
            </h2>
          </div>

          <div className="glass-card-static p-8">
            {success ? (
              <div className="text-center py-8 animate-fade-in">
                <div
                  className="inline-flex items-center justify-center rounded-full mb-4"
                  style={{
                    width: 64,
                    height: 64,
                    background: 'var(--success-light)',
                  }}
                >
                  <UserPlus size={28} style={{ color: 'var(--success)' }} />
                </div>
                <h2
                  className="text-xl font-bold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Conta criada com sucesso!
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Redirecionando para o login...
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <h1
                    className="text-2xl font-bold mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Criar conta
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                    Preencha os dados abaixo para se registrar
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

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="input-label">Nome Completo</label>
                    <input
                      id="register-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-premium"
                      placeholder="Seu nome completo"
                      required
                    />
                  </div>

                  <div>
                    <label className="input-label">Email</label>
                    <input
                      id="register-email"
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
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-premium"
                        style={{ paddingRight: '3rem' }}
                        placeholder="Mínimo 6 caracteres"
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

                  <div>
                    <label className="input-label">Confirmar Senha</label>
                    <input
                      id="register-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-premium"
                      placeholder="Repita a senha"
                      required
                    />
                  </div>

                  <button
                    id="register-submit"
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                    style={{ padding: '0.875rem 1.5rem' }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Registrando...
                      </span>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Registrar
                      </>
                    )}
                  </button>
                </form>

                <p
                  className="text-center mt-6 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Já tem conta?{' '}
                  <Link
                    href="/login"
                    className="font-semibold hover:underline"
                    style={{ color: 'var(--primary-400)' }}
                  >
                    Faça login
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
