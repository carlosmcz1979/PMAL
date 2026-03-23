'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  Activity,
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Shield,
  X,
  Check,
} from 'lucide-react'

// ────────────────────────────────────────────
// Validação de força da senha
// ────────────────────────────────────────────
interface PasswordStrength {
  score: number // 0-4
  label: string
  color: string
  checks: { label: string; met: boolean }[]
}

function checkPasswordStrength(password: string): PasswordStrength {
  const checks = [
    { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
    { label: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
    { label: 'Uma letra minúscula', met: /[a-z]/.test(password) },
    { label: 'Um número', met: /\d/.test(password) },
    { label: 'Um símbolo (!@#$...)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ]

  const score = checks.filter((c) => c.met).length

  const configs = [
    { label: 'Muito fraca', color: '#ef4444' },
    { label: 'Fraca', color: '#f97316' },
    { label: 'Razoável', color: '#eab308' },
    { label: 'Boa', color: '#22c55e' },
    { label: 'Excelente', color: '#10b981' },
    { label: 'Excelente', color: '#10b981' },
  ]

  return { score, ...configs[score], checks }
}

// ────────────────────────────────────────────
// Toast
// ────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 5000); return () => clearTimeout(t) }, [onClose])
  return (
    <div
      className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg animate-fade-in"
      style={{ background: type === 'success' ? 'var(--success)' : 'var(--danger)', color: 'white', minWidth: 280, maxWidth: 420 }}
    >
      {type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}><X size={16} /></button>
    </div>
  )
}

// ────────────────────────────────────────────
// Componente Principal
// ────────────────────────────────────────────
export default function RegistroContribuinte() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [success, setSuccess] = useState(false)

  const strength = checkPasswordStrength(password)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  // ── Validação do formulário ──────────────────────
  const isFormValid =
    email.trim() !== '' &&
    strength.score >= 4 &&
    passwordsMatch &&
    acceptTerms

  // ── Registro ─────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isFormValid) return

    // Validação final de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setToast({ message: 'Email inválido.', type: 'error' })
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            tipo: 'contribuinte',
            nome_completo: email.split('@')[0],
          },
          emailRedirectTo: `${window.location.origin}/contribuinte/confirmacao`,
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setToast({ message: 'Este email já está cadastrado. Faça login.', type: 'error' })
        } else {
          setToast({ message: error.message, type: 'error' })
        }
        setLoading(false)
        return
      }

      if (data.user) {
        setSuccess(true)
      }
    } catch (err) {
      setToast({ message: 'Erro inesperado. Tente novamente.', type: 'error' })
    }

    setLoading(false)
  }

  // ── Tela de sucesso ──────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
        <div className="w-full max-w-md text-center animate-fade-in">
          <div
            className="flex items-center justify-center rounded-full mx-auto mb-6"
            style={{
              width: 80,
              height: 80,
              background: 'rgba(16, 185, 129, 0.15)',
              border: '3px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <Mail size={36} style={{ color: 'var(--success)' }} />
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Verifique seu email
          </h1>
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Enviamos um link de confirmação para:
          </p>
          <p className="text-base font-semibold mb-6" style={{ color: 'var(--primary-400)' }}>
            {email}
          </p>
          <div
            className="p-4 rounded-xl mb-6 text-sm text-left space-y-2"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
          >
            <p style={{ color: 'var(--text-secondary)' }}>
              📧 Clique no link que enviamos para ativar sua conta
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              ⏰ O link é válido por <strong>24 horas</strong>
            </p>
            <p style={{ color: 'var(--text-muted)' }}>
              Não recebeu? Verifique a pasta de spam ou lixo eletrônico
            </p>
          </div>
          <Link
            href="/login"
            className="btn-primary inline-flex items-center gap-2"
            style={{ textDecoration: 'none', padding: '0.875rem 2rem' }}
          >
            Ir para Login
          </Link>
        </div>
      </div>
    )
  }

  // ── Formulário ───────────────────────────────────
  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Left Side — Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--primary-950) 0%, var(--primary-800) 50%, var(--primary-700) 100%)',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 rounded-full opacity-10" style={{ width: 400, height: 400, background: 'var(--primary-400)' }} />
        <div className="absolute -bottom-32 -right-32 rounded-full opacity-10" style={{ width: 500, height: 500, background: 'var(--primary-300)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-5" style={{ width: 300, height: 300, background: 'white' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 animate-fade-in">
          <div className="flex items-center justify-center rounded-xl" style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
            <Activity size={28} color="white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">VISA Maceió</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Vigilância Sanitária</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Portal do<br />
            <span style={{ color: 'var(--primary-300)' }}>Contribuinte</span>
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Solicite sua licença sanitária de forma 100% digital.
            Acompanhe o status em tempo real, receba notificações
            e gerencie seus estabelecimentos.
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
          {[
            { icon: Building2, label: 'Cadastre seus estabelecimentos' },
            { icon: Shield, label: 'Solicite licenças online' },
            { icon: CheckCircle, label: 'Acompanhe em tempo real' },
            { icon: Mail, label: 'Receba notificações' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <f.icon size={20} style={{ color: 'var(--primary-300)' }} />
              <span className="text-sm text-white">{f.label}</span>
            </div>
          ))}
        </div>

        <p className="relative z-10 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Prefeitura Municipal de Maceió · Secretaria de Saúde
        </p>
      </div>

      {/* Right Side — Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="flex items-center justify-center rounded-xl" style={{ width: 44, height: 44, background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))' }}>
              <Activity size={24} color="white" />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>VISA Maceió</h1>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Portal do Contribuinte</p>
            </div>
          </div>

          {/* Card */}
          <div
            className="glass-card-static p-8 animate-fade-in"
            style={{ animationDelay: '100ms' }}
          >
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                Criar Conta
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Cadastre-se para acessar o portal do contribuinte
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              {/* Email */}
              <div>
                <label className="input-label">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-premium"
                    style={{ paddingLeft: '2.75rem' }}
                    placeholder="seu@email.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="input-label">Senha</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-premium"
                    style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                    placeholder="Crie uma senha forte"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Barra de força da senha */}
                {password && (
                  <div className="mt-3 space-y-2 animate-fade-in">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1.5 flex-1 rounded-full transition-all"
                          style={{
                            background: i < strength.score ? strength.color : 'var(--bg-input)',
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-medium" style={{ color: strength.color }}>
                      {strength.label}
                    </p>
                    <div className="space-y-1">
                      {strength.checks.map((check, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          {check.met ? (
                            <Check size={12} style={{ color: 'var(--success)' }} />
                          ) : (
                            <X size={12} style={{ color: 'var(--text-muted)' }} />
                          )}
                          <span style={{ color: check.met ? 'var(--success)' : 'var(--text-muted)' }}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="input-label">Confirmar Senha</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-premium"
                    style={{
                      paddingLeft: '2.75rem',
                      paddingRight: '2.75rem',
                      borderColor: confirmPassword && !passwordsMatch ? 'var(--danger)' : undefined,
                    }}
                    placeholder="Repita a senha"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--danger)' }}>
                    <AlertTriangle size={12} />
                    As senhas não coincidem
                  </p>
                )}
                {passwordsMatch && (
                  <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--success)' }}>
                    <CheckCircle size={12} />
                    Senhas conferem
                  </p>
                )}
              </div>

              {/* Termos de uso */}
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setAcceptTerms(!acceptTerms)}
                  className="flex items-center justify-center rounded-md flex-shrink-0 mt-0.5"
                  style={{
                    width: 22,
                    height: 22,
                    background: acceptTerms ? 'var(--primary-600)' : 'var(--bg-input)',
                    border: `2px solid ${acceptTerms ? 'var(--primary-500)' : 'var(--border-default)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {acceptTerms && <Check size={14} color="white" />}
                </button>
                <label className="text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                  Li e aceito os{' '}
                  <span
                    className="font-semibold underline"
                    style={{ color: 'var(--primary-400)', cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); setAcceptTerms(!acceptTerms) }}
                  >
                    Termos de Uso
                  </span>
                  {' '}e a{' '}
                  <span
                    className="font-semibold underline"
                    style={{ color: 'var(--primary-400)', cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); setAcceptTerms(!acceptTerms) }}
                  >
                    Política de Privacidade
                  </span>
                </label>
              </div>

              {/* Botão de registro */}
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="btn-primary w-full"
                style={{
                  padding: '0.875rem',
                  opacity: !isFormValid ? 0.5 : 1,
                  transition: 'all 0.3s',
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Criando conta...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <Shield size={18} />
                    Criar Conta
                  </span>
                )}
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Já tem conta?{' '}
                <Link href="/login" className="font-semibold" style={{ color: 'var(--primary-400)' }}>
                  Faça login
                </Link>
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                É servidor público?{' '}
                <Link href="/register" className="font-semibold" style={{ color: 'var(--primary-400)' }}>
                  Acesse aqui
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
