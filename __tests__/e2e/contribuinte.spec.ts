/**
 * Testes E2E — Portal do Contribuinte
 * Testa fluxo de cadastro de estabelecimento e solicitações
 */
import { test, expect } from '@playwright/test'

test.describe('Cadastro de Estabelecimento (Contribuinte)', () => {
  test('deve exibir página de cadastro', async ({ page }) => {
    await page.goto('/contribuinte/estabelecimento/novo')
    await expect(page.locator('text=Cadastrar Estabelecimento')).toBeVisible()
    await expect(page.locator('text=Consulta CNPJ')).toBeVisible()
  })

  test('deve ter campo de CNPJ com máscara', async ({ page }) => {
    await page.goto('/contribuinte/estabelecimento/novo')
    
    const cnpjInput = page.locator('input[placeholder="00.000.000/0000-00"]')
    await cnpjInput.fill('12345678000195')
    
    // Deve formatar com máscara
    await expect(cnpjInput).toHaveValue('12.345.678/0001-95')
  })

  test('deve ter campos obrigatórios', async ({ page }) => {
    await page.goto('/contribuinte/estabelecimento/novo')
    
    // Campos obrigatórios devem ter asterisco
    await expect(page.locator('text=Nome / Razão Social')).toBeVisible()
    await expect(page.locator('text=Endereço Completo')).toBeVisible()
  })

  test('botão desabilitado sem dados válidos', async ({ page }) => {
    await page.goto('/contribuinte/estabelecimento/novo')
    
    const submitBtn = page.locator('button:has-text("Cadastrar Estabelecimento")')
    // Sem dados, botão deve estar desabilitado
    await expect(submitBtn).toBeDisabled()
  })

  test('deve ter campo de telefone com máscara', async ({ page }) => {
    await page.goto('/contribuinte/estabelecimento/novo')
    
    const phoneInput = page.locator('input[placeholder="(82) 99999-9999"]')
    await phoneInput.fill('82999998888')
    
    await expect(phoneInput).toHaveValue('(82) 99999-8888')
  })
})

test.describe('Dashboard do Contribuinte', () => {
  test('deve exibir página do dashboard', async ({ page }) => {
    await page.goto('/contribuinte/dashboard')
    await expect(page.locator('text=Portal do Contribuinte')).toBeVisible()
  })

  test('deve ter botão de novo estabelecimento', async ({ page }) => {
    await page.goto('/contribuinte/dashboard')
    await expect(page.locator('text=Novo Estabelecimento')).toBeVisible()
  })

  test('deve ter link para solicitações', async ({ page }) => {
    await page.goto('/contribuinte/dashboard')
    await expect(page.locator('text=Solicitações').first()).toBeVisible()
  })
})

test.describe('Solicitações do Contribuinte', () => {
  test('deve exibir página de solicitações', async ({ page }) => {
    await page.goto('/contribuinte/solicitacoes')
    await expect(page.locator('text=Minhas Solicitações')).toBeVisible()
  })

  test('deve ter filtros de status', async ({ page }) => {
    await page.goto('/contribuinte/solicitacoes')
    await expect(page.locator('text=Total')).toBeVisible()
    await expect(page.locator('text=Pendentes')).toBeVisible()
    await expect(page.locator('text=Aprovadas')).toBeVisible()
  })

  test('deve ter campo de busca', async ({ page }) => {
    await page.goto('/contribuinte/solicitacoes')
    await expect(page.locator('input[placeholder*="Buscar"]')).toBeVisible()
  })

  test('deve mostrar badge de realtime', async ({ page }) => {
    await page.goto('/contribuinte/solicitacoes')
    await expect(page.locator('text=Atualizações em tempo real ativas')).toBeVisible()
  })
})
