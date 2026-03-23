-- ============================================================
-- TABELA USER_PROFILES — Perfis de Usuário
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. TABELA
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id       UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL DEFAULT '',
  perfil        TEXT NOT NULL DEFAULT 'fiscal' CHECK (perfil IN ('admin', 'fiscal', 'supervisor')),
  status        TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  data_criacao  TIMESTAMPTZ DEFAULT now() NOT NULL,
  ultimo_acesso TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_perfil ON user_profiles(perfil);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);

COMMENT ON TABLE user_profiles IS 'Perfis de usuário — complementa auth.users com papel e status';


-- 2. TRIGGER: Criar perfil automaticamente ao registrar
-- ============================================================
CREATE OR REPLACE FUNCTION fn_create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, nome_completo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_create_user_profile ON auth.users;
CREATE TRIGGER trg_create_user_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION fn_create_user_profile();


-- 3. TRIGGER: Atualizar ultimo_acesso ao fazer login
-- ============================================================
CREATE OR REPLACE FUNCTION fn_update_last_access()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET ultimo_acesso = now()
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Este trigger pode não funcionar em todos os planos Supabase,
-- alternativa: atualizar via código no frontend ao fazer login.


-- 4. RLS (Row Level Security)
-- ============================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode LER perfis
CREATE POLICY "Leitura de perfis para autenticados"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Somente admins podem atualizar perfis
CREATE POLICY "Admin pode atualizar perfis"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = (SELECT auth.uid())
      AND perfil = 'admin'
    )
  );

-- Somente admins podem inserir perfis
CREATE POLICY "Admin pode inserir perfis"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = (SELECT auth.uid())
      AND perfil = 'admin'
    )
  );

-- Somente admins podem deletar perfis (exceto o próprio admin)
CREATE POLICY "Admin pode deletar perfis (nao o proprio)"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = (SELECT auth.uid())
      AND perfil = 'admin'
    )
    AND user_id != (SELECT auth.uid())
  );


-- 5. AUDITORIA: Trigger na user_profiles
-- ============================================================
DROP TRIGGER IF EXISTS trg_audit_user_profiles ON user_profiles;
CREATE TRIGGER trg_audit_user_profiles
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();


-- 6. CRIAR PERFIL PARA USUÁRIOS EXISTENTES (se houver)
-- ============================================================
INSERT INTO user_profiles (user_id, nome_completo)
SELECT id, COALESCE(raw_user_meta_data->>'nome_completo', email)
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles)
ON CONFLICT (user_id) DO NOTHING;
