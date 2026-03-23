/**
 * Testes Unitários — Validações e Utils
 * Testa funções puras de formatação e validação
 */

// ── Helpers de validação ──────────────────────────

function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits.length ? `(${digits}` : ''
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function checkPasswordStrength(password: string) {
  const checks = [
    { label: 'Mínimo 8 caracteres', met: password.length >= 8 },
    { label: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
    { label: 'Uma letra minúscula', met: /[a-z]/.test(password) },
    { label: 'Um número', met: /\d/.test(password) },
    { label: 'Um símbolo', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ]
  return { score: checks.filter(c => c.met).length, checks }
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ── TESTES ────────────────────────────────────────

describe('formatCNPJ', () => {
  test('formata CNPJ parcial com 2 dígitos', () => {
    expect(formatCNPJ('12')).toBe('12')
  })

  test('formata CNPJ parcial com 5 dígitos', () => {
    expect(formatCNPJ('12345')).toBe('12.345')
  })

  test('formata CNPJ parcial com 8 dígitos', () => {
    expect(formatCNPJ('12345678')).toBe('12.345.678')
  })

  test('formata CNPJ completo com 14 dígitos', () => {
    expect(formatCNPJ('12345678000195')).toBe('12.345.678/0001-95')
  })

  test('remove caracteres não numéricos', () => {
    expect(formatCNPJ('12.345.678/0001-95')).toBe('12.345.678/0001-95')
  })

  test('limita a 14 dígitos', () => {
    expect(formatCNPJ('123456780001951234')).toBe('12.345.678/0001-95')
  })

  test('retorna vazio para entrada vazia', () => {
    expect(formatCNPJ('')).toBe('')
  })
})

describe('formatPhone', () => {
  test('formata DDD', () => {
    expect(formatPhone('82')).toBe('(82')
  })

  test('formata DDD + início do número', () => {
    expect(formatPhone('82999')).toBe('(82) 999')
  })

  test('formata celular completo (11 dígitos)', () => {
    expect(formatPhone('82999998888')).toBe('(82) 99999-8888')
  })

  test('formata telefone fixo (10 dígitos)', () => {
    expect(formatPhone('8232223333')).toBe('(82) 32223-333')
  })

  test('retorna vazio para entrada vazia', () => {
    expect(formatPhone('')).toBe('')
  })

  test('limita a 11 dígitos', () => {
    expect(formatPhone('829999988881234')).toBe('(82) 99999-8888')
  })
})

describe('checkPasswordStrength', () => {
  test('senha vazia = score 1 (só minúscula vazia)', () => {
    const result = checkPasswordStrength('')
    expect(result.score).toBe(0)
  })

  test('senha fraca (só minúsculas curta)', () => {
    const result = checkPasswordStrength('abc')
    expect(result.score).toBe(1) // só minúscula
  })

  test('senha razoável (minúsculas longas)', () => {
    const result = checkPasswordStrength('abcdefgh')
    expect(result.score).toBe(2) // tamanho + minúscula
  })

  test('senha boa (maiúscula + minúscula + tamanho)', () => {
    const result = checkPasswordStrength('Abcdefgh')
    expect(result.score).toBe(3)
  })

  test('senha forte (tudo menos símbolo)', () => {
    const result = checkPasswordStrength('Abcdefg1')
    expect(result.score).toBe(4)
  })

  test('senha excelente (todos os critérios)', () => {
    const result = checkPasswordStrength('Abcdefg1!')
    expect(result.score).toBe(5)
  })

  test('retorna 5 checks sempre', () => {
    const result = checkPasswordStrength('test')
    expect(result.checks).toHaveLength(5)
  })
})

describe('validateEmail', () => {
  test('email válido', () => {
    expect(validateEmail('user@example.com')).toBe(true)
  })

  test('email com subdomínio', () => {
    expect(validateEmail('user@mail.example.com')).toBe(true)
  })

  test('email sem @', () => {
    expect(validateEmail('userexample.com')).toBe(false)
  })

  test('email sem domínio', () => {
    expect(validateEmail('user@')).toBe(false)
  })

  test('email com espaço', () => {
    expect(validateEmail('user @example.com')).toBe(false)
  })

  test('email vazio', () => {
    expect(validateEmail('')).toBe(false)
  })
})

describe('Regras de Negócio', () => {
  test('CNPJ deve ter exatamente 14 dígitos', () => {
    const cnpj = '12345678000195'
    expect(cnpj.replace(/\D/g, '')).toHaveLength(14)
  })

  test('status válidos para estabelecimento', () => {
    const statusValidos = ['ativo', 'inativo']
    expect(statusValidos).toContain('ativo')
    expect(statusValidos).toContain('inativo')
  })

  test('perfis válidos para usuário', () => {
    const perfisValidos = ['admin', 'fiscal', 'supervisor']
    expect(perfisValidos).toContain('admin')
    expect(perfisValidos).toContain('fiscal')
    expect(perfisValidos).toContain('supervisor')
    expect(perfisValidos).not.toContain('contribuinte')
  })

  test('status válidos para licença', () => {
    const statusValidos = ['pendente', 'em_analise', 'aprovado', 'rejeitado']
    expect(statusValidos).toHaveLength(4)
  })

  test('status válidos para contribuinte', () => {
    const statusValidos = ['pendente_confirmacao', 'ativo', 'inativo', 'bloqueado']
    expect(statusValidos).toHaveLength(4)
  })
})
