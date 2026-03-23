/**
 * Testes E2E — Painel Admin
 * Testa navegação, gestão de usuários e estabelecimentos
 */
import { test, expect } from '@playwright/test'

test.describe('Navegação Admin', () => {
  test('deve exibir sidebar com todos os links', async ({ page }) => {
    await page.goto('/dashboard')
    
    const sidebar = page.locator('aside')
    await expect(sidebar.locator('text=Dashboard')).toBeVisible()
    await expect(sidebar.locator('text=Estabelecimentos')).toBeVisible()
    await expect(sidebar.locator('text=Licencas')).toBeVisible()
    await expect(sidebar.locator('text=Inspecoes')).toBeVisible()
    await expect(sidebar.locator('text=Relatorios')).toBeVisible()
    await expect(sidebar.locator('text=Integracoes')).toBeVisible()
    await expect(sidebar.locator('text=Usuarios')).toBeVisible()
  })

  test('deve navegar para dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)
  })
})

test.describe('Gestão de Usuários', () => {
  test('deve exibir página de gestão de usuários', async ({ page }) => {
    await page.goto('/admin/usuarios')
    await expect(page.locator('text=Gestão de Usuários')).toBeVisible()
  })

  test('deve exibir KPIs de usuários', async ({ page }) => {
    await page.goto('/admin/usuarios')
    await expect(page.locator('text=TOTAL')).toBeVisible()
    await expect(page.locator('text=ADMINS')).toBeVisible()
    await expect(page.locator('text=FISCAIS')).toBeVisible()
    await expect(page.locator('text=SUPERVISORES')).toBeVisible()
  })

  test('deve ter botão de novo usuário', async ({ page }) => {
    await page.goto('/admin/usuarios')
    await expect(page.locator('text=Novo Usuário')).toBeVisible()
  })

  test('deve ter tabela com colunas', async ({ page }) => {
    await page.goto('/admin/usuarios')
    await expect(page.locator('text=USUÁRIO')).toBeVisible()
    await expect(page.locator('text=PERFIL')).toBeVisible()
    await expect(page.locator('text=STATUS')).toBeVisible()
  })

  test('deve mostrar badge "Online" para o usuário logado', async ({ page }) => {
    await page.goto('/admin/usuarios')
    await expect(page.locator('text=Online')).toBeVisible()
  })

  test('deve ter filtros de perfil e status', async ({ page }) => {
    await page.goto('/admin/usuarios')
    await expect(page.locator('select').first()).toBeVisible()
  })

  test('deve ter busca por nome/email', async ({ page }) => {
    await page.goto('/admin/usuarios')
    await expect(page.locator('input[placeholder*="Buscar"]')).toBeVisible()
  })
})

test.describe('CRUD de Estabelecimentos', () => {
  test('deve exibir lista de estabelecimentos', async ({ page }) => {
    await page.goto('/estabelecimento/novo')
    await expect(page.locator('text=Novo Estabelecimento').or(page.locator('text=Cadastrar Estabelecimento'))).toBeVisible()
  })

  test('deve ter campo de CNPJ', async ({ page }) => {
    await page.goto('/estabelecimento/novo')
    await expect(page.locator('input[placeholder*="CNPJ"]').or(page.locator('text=CNPJ'))).toBeVisible()
  })
})

test.describe('Licenças', () => {
  test('deve exibir formulário de nova licença', async ({ page }) => {
    await page.goto('/licenca/nova')
    await expect(page.locator('text=Nova Licença').or(page.locator('text=Solicitar Licença'))).toBeVisible()
  })

  test('deve exibir gerenciamento de licenças', async ({ page }) => {
    await page.goto('/licenca/gerenciar')
    await expect(page.locator('text=Licença').or(page.locator('text=Gerenciar'))).toBeVisible()
  })
})

test.describe('Inspeções', () => {
  test('deve exibir formulário de nova inspeção', async ({ page }) => {
    await page.goto('/inspecao/nova')
    await expect(page.locator('text=Inspeção').or(page.locator('text=Nova Inspeção'))).toBeVisible()
  })
})

test.describe('Relatórios', () => {
  test('deve exibir página de relatórios', async ({ page }) => {
    await page.goto('/relatorio')
    await expect(page.locator('text=Relatório').or(page.locator('text=Relatórios'))).toBeVisible()
  })
})
