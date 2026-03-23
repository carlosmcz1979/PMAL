-- ============================================================
-- RLS POR PERFIL — VISA Maceió
-- Execute no Supabase SQL Editor
-- Pré-requisito: 001_audit_log.sql e 002_user_profiles.sql
-- ============================================================


-- ============================================================
-- 1. ADICIONAR COLUNAS NECESSÁRIAS
-- ============================================================

-- Região e equipe no perfil do usuário
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS regiao TEXT DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS equipe_id UUID DEFAULT NULL;

-- Região no estabelecimento (para filtrar por fiscal)
ALTER TABLE estabelecimentos ADD COLUMN IF NOT EXISTS regiao TEXT DEFAULT NULL;

-- Índices para JOIN rápido
CREATE INDEX IF NOT EXISTS idx_user_profiles_regiao ON user_profiles(regiao);
CREATE INDEX IF NOT EXISTS idx_user_profiles_equipe ON user_profiles(equipe_id);
CREATE INDEX IF NOT EXISTS idx_estabelecimentos_regiao ON estabelecimentos(regiao);

COMMENT ON COLUMN user_profiles.regiao IS 'Região do fiscal (ex: Centro, Jaraguá, Farol)';
COMMENT ON COLUMN user_profiles.equipe_id IS 'ID da equipe do supervisor';
COMMENT ON COLUMN estabelecimentos.regiao IS 'Região/bairro do estabelecimento';


-- ============================================================
-- 2. FUNÇÕES AUXILIARES DE VERIFICAÇÃO
-- ============================================================

-- Retorna o perfil do usuário logado (com cache de sessão)
CREATE OR REPLACE FUNCTION fn_get_user_perfil()
RETURNS TEXT AS $$
  SELECT perfil FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Retorna a região do usuário logado
CREATE OR REPLACE FUNCTION fn_get_user_regiao()
RETURNS TEXT AS $$
  SELECT regiao FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Retorna o equipe_id do usuário logado
CREATE OR REPLACE FUNCTION fn_get_user_equipe()
RETURNS UUID AS $$
  SELECT equipe_id FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Verifica se o usuário é admin
CREATE OR REPLACE FUNCTION fn_is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND perfil = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================
-- 3. REMOVER POLÍTICAS ANTIGAS (limpeza segura)
-- ============================================================

-- Estabelecimentos
DO $$ BEGIN
  DROP POLICY IF EXISTS "estabelecimentos_select_all" ON estabelecimentos;
  DROP POLICY IF EXISTS "estabelecimentos_insert_all" ON estabelecimentos;
  DROP POLICY IF EXISTS "estabelecimentos_update_all" ON estabelecimentos;
  DROP POLICY IF EXISTS "estabelecimentos_delete_all" ON estabelecimentos;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Licenças
DO $$ BEGIN
  DROP POLICY IF EXISTS "licencas_select_all" ON licencas;
  DROP POLICY IF EXISTS "licencas_insert_all" ON licencas;
  DROP POLICY IF EXISTS "licencas_update_all" ON licencas;
  DROP POLICY IF EXISTS "licencas_delete_all" ON licencas;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Inspeções
DO $$ BEGIN
  DROP POLICY IF EXISTS "inspecoes_select_all" ON inspecoes;
  DROP POLICY IF EXISTS "inspecoes_insert_all" ON inspecoes;
  DROP POLICY IF EXISTS "inspecoes_update_all" ON inspecoes;
  DROP POLICY IF EXISTS "inspecoes_delete_all" ON inspecoes;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;


-- ============================================================
-- 4. ATIVAR RLS
-- ============================================================

ALTER TABLE estabelecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE licencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspecoes ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 5. POLÍTICAS — ESTABELECIMENTOS
-- ============================================================

-- SELECT: Admin vê tudo | Fiscal vê sua região | Supervisor vê sua equipe
CREATE POLICY "estabelecimentos_select_all" ON estabelecimentos
  FOR SELECT TO authenticated
  USING (
    fn_is_admin()
    OR (
      fn_get_user_perfil() = 'fiscal'
      AND (
        regiao = fn_get_user_regiao()
        OR fn_get_user_regiao() IS NULL
        OR user_id = auth.uid()
      )
    )
    OR (
      fn_get_user_perfil() = 'supervisor'
      AND user_id IN (
        SELECT up.user_id FROM user_profiles up
        WHERE up.equipe_id = fn_get_user_equipe()
      )
    )
    OR user_id = auth.uid()
  );

-- INSERT: Admin e Fiscal podem criar
CREATE POLICY "estabelecimentos_insert_all" ON estabelecimentos
  FOR INSERT TO authenticated
  WITH CHECK (
    fn_is_admin()
    OR fn_get_user_perfil() = 'fiscal'
    OR user_id = auth.uid()
  );

-- UPDATE: Admin atualiza tudo | Fiscal atualiza sua região | Supervisor sua equipe
CREATE POLICY "estabelecimentos_update_all" ON estabelecimentos
  FOR UPDATE TO authenticated
  USING (
    fn_is_admin()
    OR (
      fn_get_user_perfil() = 'fiscal'
      AND (regiao = fn_get_user_regiao() OR fn_get_user_regiao() IS NULL)
    )
    OR (
      fn_get_user_perfil() = 'supervisor'
      AND user_id IN (
        SELECT up.user_id FROM user_profiles up
        WHERE up.equipe_id = fn_get_user_equipe()
      )
    )
    OR user_id = auth.uid()
  );

-- DELETE: Somente admin pode excluir
CREATE POLICY "estabelecimentos_delete_all" ON estabelecimentos
  FOR DELETE TO authenticated
  USING (fn_is_admin());


-- ============================================================
-- 6. POLÍTICAS — LICENÇAS
-- ============================================================

-- SELECT: Segue a visibilidade do estabelecimento vinculado
CREATE POLICY "licencas_select_all" ON licencas
  FOR SELECT TO authenticated
  USING (
    fn_is_admin()
    OR estabelecimento_id IN (
      SELECT id FROM estabelecimentos
    )
  );

-- INSERT: Quem pode ver o estabelecimento pode solicitar licença
CREATE POLICY "licencas_insert_all" ON licencas
  FOR INSERT TO authenticated
  WITH CHECK (
    fn_is_admin()
    OR fn_get_user_perfil() IN ('fiscal', 'supervisor')
    OR estabelecimento_id IN (
      SELECT id FROM estabelecimentos WHERE user_id = auth.uid()
    )
  );

-- UPDATE: Admin e fiscal podem aprovar/rejeitar
CREATE POLICY "licencas_update_all" ON licencas
  FOR UPDATE TO authenticated
  USING (
    fn_is_admin()
    OR fn_get_user_perfil() IN ('fiscal', 'supervisor')
  );

-- DELETE: Somente admin
CREATE POLICY "licencas_delete_all" ON licencas
  FOR DELETE TO authenticated
  USING (fn_is_admin());


-- ============================================================
-- 7. POLÍTICAS — INSPEÇÕES
-- ============================================================

-- SELECT: Segue a visibilidade do estabelecimento vinculado
CREATE POLICY "inspecoes_select_all" ON inspecoes
  FOR SELECT TO authenticated
  USING (
    fn_is_admin()
    OR estabelecimento_id IN (
      SELECT id FROM estabelecimentos
    )
  );

-- INSERT: Admin e fiscal podem criar inspeções
CREATE POLICY "inspecoes_insert_all" ON inspecoes
  FOR INSERT TO authenticated
  WITH CHECK (
    fn_is_admin()
    OR fn_get_user_perfil() IN ('fiscal', 'supervisor')
  );

-- UPDATE: Admin e fiscal podem editar
CREATE POLICY "inspecoes_update_all" ON inspecoes
  FOR UPDATE TO authenticated
  USING (
    fn_is_admin()
    OR fn_get_user_perfil() IN ('fiscal', 'supervisor')
  );

-- DELETE: Somente admin
CREATE POLICY "inspecoes_delete_all" ON inspecoes
  FOR DELETE TO authenticated
  USING (fn_is_admin());


-- ============================================================
-- 8. REGIÕES DE MACEIÓ (dados iniciais)
-- ============================================================

COMMENT ON TABLE estabelecimentos IS
'Regiões válidas: Centro, Farol, Jaragua, Pajucara, Ponta Verde, '
'Mangabeiras, Stella Maris, Cruz das Almas, Jacintinho, Tabuleiro, '
'Benedito Bentes, Cidade Universitaria, Clima Bom, Santos Dumont, '
'Vergel do Lago, Levada, Poço, Serraria, Antares, Gruta de Lourdes';
