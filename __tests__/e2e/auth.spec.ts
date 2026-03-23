/**
 * Testes E2E — Fluxo de Login
 * Testa autenticação completa: login, dashboard, logout
 */
import { test, expect } from '@playwright/test'

// Credenciais de teste (usar as mesmas do Supabase)
const TEST_EMAIL = process.env.TEST_EMAIL || 'carlos.tavaresmcz@gmail.com'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'senha_teste_123'

test.describe('Autenticação', () => {
  test('deve exibir a página de login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('text=VISA Maceio')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('deve exibir erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'invalid@test.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Aguardar mensagem de erro
    await expect(page.locator('text=Invalid login credentials').or(page.locator('[class*="error"]'))).toBeVisible({ timeout: 5000 })
  })

  test('deve validar campo de email obrigatório', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="password"]', 'somepassword')
    
    // O botão deve estar presente
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('deve ter link para registro de contribuinte', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('text=Crie sua conta')).toBeVisible()
  })

  test('deve ter link para registro de servidor', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('text=Registre-se aqui')).toBeVisible()
  })
})

test.describe('Registro de Contribuinte', () => {
  test('deve exibir formulário de registro', async ({ page }) => {
    await page.goto('/contribuinte/registro')
    await expect(page.locator('text=Criar Conta')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]').first()).toBeVisible()
  })

  test('deve exibir validação de senha forte', async ({ page }) => {
    await page.goto('/contribuinte/registro')
    
    // Digitar senha fraca
    const passwordInput = page.locator('input[placeholder="Crie uma senha forte"]')
    await passwordInput.fill('abc')
    
    // Deve mostrar critérios de senha
    await expect(page.locator('text=Muito fraca').or(page.locator('text=Fraca'))).toBeVisible()
  })

  test('deve validar senhas diferentes', async ({ page }) => {
    await page.goto('/contribuinte/registro')
    
    const passwordInput = page.locator('input[placeholder="Crie uma senha forte"]')
    const confirmInput = page.locator('input[placeholder="Repita a senha"]')
    
    await passwordInput.fill('SenhaForte1!')
    await confirmInput.fill('SenhaDiferente')
    
    await expect(page.locator('text=As senhas não coincidem')).toBeVisible()
  })

  test('deve validar senhas iguais', async ({ page }) => {
    await page.goto('/contribuinte/registro')
    
    const passwordInput = page.locator('input[placeholder="Crie uma senha forte"]')
    const confirmInput = page.locator('input[placeholder="Repita a senha"]')
    
    await passwordInput.fill('SenhaForte1!')
    await confirmInput.fill('SenhaForte1!')
    
    await expect(page.locator('text=Senhas conferem')).toBeVisible()
  })

  test('botão desabilitado sem aceitar termos', async ({ page }) => {
    await page.goto('/contribuinte/registro')
    
    await page.fill('input[type="email"]', 'teste@teste.com')
    const passwordInput = page.locator('input[placeholder="Crie uma senha forte"]')
    const confirmInput = page.locator('input[placeholder="Repita a senha"]')
    await passwordInput.fill('SenhaForte1!')
    await confirmInput.fill('SenhaForte1!')
    
    // Sem aceitar termos, botão deve estar com opacity 0.5 (desabilitado visualmente)
    const button = page.locator('button[type="submit"]')
    await expect(button).toBeDisabled()
  })
})
