'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import AppLayout from '@/components/AppLayout'
import {
  Users,
  Plus,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  Shield,
  ShieldCheck,
  Eye,
  ToggleLeft,
  ToggleRight,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  User,
} from 'lucide-react'

// ────────────────────────────────────────────
// Tipos
// ────────────────────────────────────────────
interface UserProfile {
  user_id: string
  nome_completo: string
  perfil: 'admin' | 'fiscal' | 'supervisor'
  status: 'ativo' | 'inativo'
  data_criacao: string
  ultimo_acesso: string | null
  email?: string // vem do join
}

type SortField = 'nome_completo' | 'email' | 'perfil' | 'status' | 'data_criacao'
type SortDirection = 'asc' | 'desc'

// ────────────────────────────────────────────
// Constantes
// ────────────────────────────────────────────
const PERFIL_CONFIG = {
  admin: { label: 'Admin', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: ShieldCheck },
  supervisor: { label: 'Supervisor', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Shield },
  fiscal: { label: 'Fiscal', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: Eye },
}

const PER_PAGE = 10

// ────────────────────────────────────────────
// Toast simples
// ────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t) }, [onClose])
  return (
    <div
      className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg animate-fade-in"
      style={{ background: type === 'success' ? 'var(--success)' : 'var(--danger)', color: 'white', minWidth: 280, maxWidth: 420 }}
    >
      {type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
        <X size={16} />
      </button>
    </div>
  )
}

// ────────────────────────────────────────────
// Modal de Usuário (Criar/Editar)
// ────────────────────────────────────────────
function UserModal({
  user,
  onClose,
  onSave,
}: {
  user: UserProfile | null // null = criação
  onClose: () => void
  onSave: (data: { email: string; password?: string; nome_completo: string; perfil: string }) => Promise<void>
}) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    nome_completo: user?.nome_completo || '',
    perfil: user?.perfil || 'fiscal',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEditing = !!user

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validações
    if (!formData.nome_completo.trim()) { setError('Nome é obrigatório'); return }
    if (!isEditing) {
      if (!formData.email.trim()) { setError('Email é obrigatório'); return }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) { setError('Email inválido'); return }
      if (!formData.password) { setError('Senha é obrigatória para novos usuários'); return }
      if (formData.password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres'); return }
    }

    setSaving(true)
    try {
      await onSave(formData)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar')
    }
    setSaving(false)
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass-card-static p-6 w-full max-w-md animate-fade-in"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            className="p-3 rounded-lg mb-4 text-sm font-medium flex items-center gap-2"
            style={{ background: 'var(--danger-light)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="input-label">Nome Completo *</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={formData.nome_completo}
                onChange={(e) => setFormData(f => ({ ...f, nome_completo: e.target.value }))}
                className="input-premium"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="Nome do usuário"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="input-label">Email *</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                className="input-premium"
                style={{ paddingLeft: '2.75rem' }}
                placeholder="email@prefeitura.gov.br"
                required
                disabled={isEditing} // Email não pode ser alterado
              />
            </div>
            {isEditing && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Email não pode ser alterado após criação
              </p>
            )}
          </div>

          {/* Senha (só na criação) */}
          {!isEditing && (
            <div>
              <label className="input-label">Senha *</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(f => ({ ...f, password: e.target.value }))}
                className="input-premium"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>
          )}

          {/* Perfil */}
          <div>
            <label className="input-label">Perfil *</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {(['admin', 'fiscal', 'supervisor'] as const).map((p) => {
                const config = PERFIL_CONFIG[p]
                const Icon = config.icon
                const selected = formData.perfil === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, perfil: p }))}
                    className="p-3 rounded-xl text-center text-sm font-semibold transition-all flex flex-col items-center gap-1"
                    style={{
                      background: selected ? config.bg : 'var(--bg-input)',
                      border: `2px solid ${selected ? config.color : 'var(--border-default)'}`,
                      color: selected ? config.color : 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon size={18} />
                    {config.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1"
              style={{ padding: '0.75rem' }}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </span>
              ) : (
                <>
                  <Save size={16} />
                  {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
                </>
              )}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.75rem' }}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────
// Modal de Confirmação de Exclusão
// ────────────────────────────────────────────
function DeleteModal({
  user,
  onClose,
  onConfirm,
}: {
  user: UserProfile
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await onConfirm()
    setDeleting(false)
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-card-static p-6 w-full max-w-sm animate-fade-in text-center">
        <div
          className="flex items-center justify-center rounded-full mx-auto mb-4"
          style={{ width: 56, height: 56, background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.2)' }}
        >
          <Trash2 size={24} style={{ color: 'var(--danger)' }} />
        </div>
        <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Excluir Usuário?
        </h3>
        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
          <strong>{user.nome_completo}</strong>
        </p>
        <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
          {user.email} — Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger flex-1"
            style={{ padding: '0.75rem' }}
          >
            {deleting ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Excluindo...
              </span>
            ) : (
              <>
                <Trash2 size={16} />
                Excluir
              </>
            )}
          </button>
          <button onClick={onClose} className="btn-secondary flex-1" style={{ padding: '0.75rem' }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

// ────────────────────────────────────────────
// Página Principal
// ────────────────────────────────────────────
export default function GerenciarUsuarios() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null)

  // Filtros
  const [search, setSearch] = useState('')
  const [filterPerfil, setFilterPerfil] = useState('todos')
  const [filterStatus, setFilterStatus] = useState('todos')

  // Ordenação
  const [sortField, setSortField] = useState<SortField>('nome_completo')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Paginação
  const [page, setPage] = useState(1)

  // ── Buscar dados ─────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) setCurrentUserId(user.id)

    // Busca perfis + email do auth.users via view ou columns
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order(sortField, { ascending: sortDirection === 'asc' })

    if (error) {
      console.error('Erro ao buscar perfis:', error)
      setToast({ message: 'Erro ao carregar usuários', type: 'error' })
      setLoading(false)
      return
    }

    // Busca emails dos auth.users (via Supabase Admin ou tabela)
    // Como não temos acesso direto ao auth.users via client,
    // buscamos o email do usuário logado e mostramos user_id para os demais
    if (data) {
      const enriched = data.map((profile: any) => ({
        ...profile,
        email: profile.user_id === user?.id ? user?.email : `user-${profile.user_id.substring(0, 8)}@email`,
      }))
      setUsers(enriched)
    }

    setLoading(false)
  }, [sortField, sortDirection])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // ── Filtrar e paginar ────────────────────────────
  const filteredUsers = users
    .filter((u) => {
      if (search) {
        const s = search.toLowerCase()
        if (!u.nome_completo.toLowerCase().includes(s) && !(u.email || '').toLowerCase().includes(s)) return false
      }
      if (filterPerfil !== 'todos' && u.perfil !== filterPerfil) return false
      if (filterStatus !== 'todos' && u.status !== filterStatus) return false
      return true
    })

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PER_PAGE))
  const paginatedUsers = filteredUsers.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // Reset page quando muda filtro
  useEffect(() => { setPage(1) }, [search, filterPerfil, filterStatus])

  // ── Criar usuário ────────────────────────────────
  const handleCreateUser = async (data: { email: string; password?: string; nome_completo: string; perfil: string }) => {
    // Cria no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password!,
      options: {
        data: { nome_completo: data.nome_completo },
      },
    })

    if (authError) throw authError

    if (authData.user) {
      // Atualiza o perfil (trigger já criou, mas atualiza perfil se diferente de fiscal)
      if (data.perfil !== 'fiscal') {
        await supabase
          .from('user_profiles')
          .update({ perfil: data.perfil, nome_completo: data.nome_completo })
          .eq('user_id', authData.user.id)
      }
    }

    setShowCreateModal(false)
    setToast({ message: `Usuário ${data.nome_completo} criado com sucesso!`, type: 'success' })
    fetchUsers()
  }

  // ── Editar usuário ───────────────────────────────
  const handleEditUser = async (data: { email: string; nome_completo: string; perfil: string }) => {
    if (!editingUser) return

    const { error } = await supabase
      .from('user_profiles')
      .update({
        nome_completo: data.nome_completo.trim(),
        perfil: data.perfil,
      })
      .eq('user_id', editingUser.user_id)

    if (error) throw error

    setEditingUser(null)
    setToast({ message: `Usuário ${data.nome_completo} atualizado!`, type: 'success' })
    fetchUsers()
  }

  // ── Deletar usuário ──────────────────────────────
  const handleDeleteUser = async () => {
    if (!deletingUser) return

    // Proteção: não pode deletar admin (a si mesmo)
    if (deletingUser.user_id === currentUserId) {
      setToast({ message: 'Você não pode excluir sua própria conta.', type: 'error' })
      setDeletingUser(null)
      return
    }

    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', deletingUser.user_id)

    if (error) {
      setToast({ message: `Erro ao excluir: ${error.message}`, type: 'error' })
    } else {
      setToast({ message: `Usuário ${deletingUser.nome_completo} excluído.`, type: 'success' })
    }

    setDeletingUser(null)
    fetchUsers()
  }

  // ── Toggle status ────────────────────────────────
  const handleToggleStatus = async (user: UserProfile) => {
    const newStatus = user.status === 'ativo' ? 'inativo' : 'ativo'

    const { error } = await supabase
      .from('user_profiles')
      .update({ status: newStatus })
      .eq('user_id', user.user_id)

    if (error) {
      setToast({ message: `Erro ao alterar status: ${error.message}`, type: 'error' })
    } else {
      setToast({ message: `${user.nome_completo} agora está ${newStatus}.`, type: 'success' })
      fetchUsers()
    }
  }

  // ── Ordenação ────────────────────────────────────
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
  }

  // ── Contadores ───────────────────────────────────
  const counts = {
    total: users.length,
    admin: users.filter(u => u.perfil === 'admin').length,
    fiscal: users.filter(u => u.perfil === 'fiscal').length,
    supervisor: users.filter(u => u.perfil === 'supervisor').length,
    ativo: users.filter(u => u.status === 'ativo').length,
    inativo: users.filter(u => u.status === 'inativo').length,
  }

  return (
    <AppLayout
      title="Gestão de Usuários"
      subtitle={`${counts.total} usuários cadastrados · ${counts.ativo} ativos`}
      actions={
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          <Plus size={18} />
          Novo Usuário
        </button>
      }
    >
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Modais */}
      {showCreateModal && (
        <UserModal user={null} onClose={() => setShowCreateModal(false)} onSave={handleCreateUser} />
      )}
      {editingUser && (
        <UserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleEditUser} />
      )}
      {deletingUser && (
        <DeleteModal user={deletingUser} onClose={() => setDeletingUser(null)} onConfirm={handleDeleteUser} />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse-glow rounded-full" style={{ width: 48, height: 48, background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))' }} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: counts.total, gradient: 'linear-gradient(135deg, #0d9488, #0f766e)' },
              { label: 'Admins', value: counts.admin, gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
              { label: 'Fiscais', value: counts.fiscal, gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)' },
              { label: 'Supervisores', value: counts.supervisor, gradient: 'linear-gradient(135deg, #d97706, #b45309)' },
            ].map(kpi => (
              <div key={kpi.label} className="kpi-card" style={{ background: kpi.gradient, padding: '1rem' }}>
                <p className="kpi-label" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>{kpi.label}</p>
                <p className="kpi-value" style={{ color: 'white', fontSize: '1.5rem' }}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Filtros */}
          <div className="glass-card-static p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Busca */}
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-premium"
                  style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
                />
              </div>

              {/* Filtro perfil */}
              <div className="flex items-center gap-2">
                <Filter size={14} style={{ color: 'var(--text-muted)' }} />
                <select
                  value={filterPerfil}
                  onChange={(e) => setFilterPerfil(e.target.value)}
                  className="input-premium text-sm"
                  style={{ width: 140, padding: '0.5rem 0.75rem' }}
                >
                  <option value="todos">Todos perfis</option>
                  <option value="admin">Admin</option>
                  <option value="fiscal">Fiscal</option>
                  <option value="supervisor">Supervisor</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-premium text-sm"
                  style={{ width: 130, padding: '0.5rem 0.75rem' }}
                >
                  <option value="todos">Todos status</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabela */}
          <div className="glass-card-static overflow-hidden">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-default)' }}>
                    {[
                      { field: 'nome_completo' as SortField, label: 'Usuário' },
                      { field: 'perfil' as SortField, label: 'Perfil' },
                      { field: 'status' as SortField, label: 'Status' },
                      { field: 'data_criacao' as SortField, label: 'Criado em' },
                    ].map(col => (
                      <th
                        key={col.field}
                        onClick={() => handleSort(col.field)}
                        className="text-left text-xs font-semibold uppercase tracking-wider"
                        style={{
                          color: 'var(--text-muted)',
                          padding: '0.875rem 1.25rem',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <span className="flex items-center gap-1">
                          {col.label}
                          <SortIcon field={col.field} />
                        </span>
                      </th>
                    ))}
                    <th
                      className="text-right text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--text-muted)', padding: '0.875rem 1.25rem' }}
                    >
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <Users size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {search || filterPerfil !== 'todos' || filterStatus !== 'todos'
                            ? 'Nenhum usuário encontrado com esses filtros'
                            : 'Nenhum usuário cadastrado'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => {
                      const perfilConfig = PERFIL_CONFIG[user.perfil]
                      const PerfilIcon = perfilConfig.icon
                      const isCurrentUser = user.user_id === currentUserId
                      const isAdmin = user.perfil === 'admin'

                      return (
                        <tr
                          key={user.user_id}
                          style={{
                            borderBottom: '1px solid var(--border-default)',
                            background: isCurrentUser ? 'rgba(20, 184, 166, 0.06)' : undefined,
                            borderLeft: isCurrentUser ? '3px solid var(--primary-500)' : '3px solid transparent',
                          }}
                          className="group"
                        >
                          {/* Usuário */}
                          <td style={{ padding: '0.875rem 1.25rem' }}>
                            <div className="flex items-center gap-3">
                              <div
                                className="flex items-center justify-center rounded-full flex-shrink-0 text-sm font-bold"
                                style={{
                                  width: 36,
                                  height: 36,
                                  background: perfilConfig.bg,
                                  color: perfilConfig.color,
                                  border: `1px solid ${perfilConfig.color}30`,
                                }}
                              >
                                {user.nome_completo.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                  {user.nome_completo}
                                  {isCurrentUser && (
                                    <span className="text-xs ml-2 px-1.5 py-0.5 rounded-full" style={{ background: 'var(--primary-700)', color: 'white' }}>
                                      Você
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Perfil */}
                          <td style={{ padding: '0.875rem 1.25rem' }}>
                            <span
                              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                              style={{ background: perfilConfig.bg, color: perfilConfig.color }}
                            >
                              <PerfilIcon size={12} />
                              {perfilConfig.label}
                            </span>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '0.875rem 1.25rem' }}>
                            {isCurrentUser ? (
                              <span
                                className="inline-flex items-center gap-2 text-xs font-bold px-2.5 py-1 rounded-full"
                                style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                              >
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#34d399' }} />
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: '#34d399' }} />
                                </span>
                                Online
                              </span>
                            ) : (
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className="inline-flex items-center gap-1.5 text-xs font-medium"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: user.status === 'ativo' ? 'var(--text-muted)' : 'var(--danger)',
                                }}
                                title={`Clique para ${user.status === 'ativo' ? 'desativar' : 'ativar'}`}
                              >
                                {user.status === 'ativo' ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                {user.status === 'ativo' ? 'Ativo' : 'Inativo'}
                              </button>
                            )}
                          </td>

                          {/* Data criação */}
                          <td style={{ padding: '0.875rem 1.25rem' }}>
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {new Date(user.data_criacao).toLocaleDateString('pt-BR')}
                            </span>
                          </td>

                          {/* Ações */}
                          <td style={{ padding: '0.875rem 1.25rem' }}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setEditingUser(user)}
                                className="p-2 rounded-lg transition-all"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: 'var(--text-muted)',
                                }}
                                title="Editar"
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--warning)'; e.currentTarget.style.background = 'rgba(245,158,11,0.1)' }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none' }}
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => setDeletingUser(user)}
                                disabled={isCurrentUser || isAdmin}
                                className="p-2 rounded-lg transition-all"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: (isCurrentUser || isAdmin) ? 'not-allowed' : 'pointer',
                                  color: 'var(--text-muted)',
                                  opacity: (isCurrentUser || isAdmin) ? 0.3 : 1,
                                }}
                                title={isCurrentUser ? 'Não é possível excluir a si mesmo' : isAdmin ? 'Não é possível excluir admin' : 'Excluir'}
                                onMouseEnter={e => { if (!isCurrentUser && !isAdmin) { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' } }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderTop: '1px solid var(--border-default)' }}
              >
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Mostrando {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filteredUsers.length)} de {filteredUsers.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg"
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-default)',
                      cursor: page === 1 ? 'not-allowed' : 'pointer',
                      color: 'var(--text-muted)',
                      opacity: page === 1 ? 0.4 : 1,
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="text-xs font-medium px-2.5 py-1.5 rounded-lg"
                      style={{
                        background: p === page ? 'var(--primary-700)' : 'none',
                        color: p === page ? 'white' : 'var(--text-muted)',
                        border: `1px solid ${p === page ? 'var(--primary-600)' : 'var(--border-default)'}`,
                        cursor: 'pointer',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg"
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-default)',
                      cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      color: 'var(--text-muted)',
                      opacity: page === totalPages ? 0.4 : 1,
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
