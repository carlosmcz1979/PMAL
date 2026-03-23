-- ============================================================
-- TABELA CONTRIBUINTES — Portal do Contribuinte
-- Execute no Supabase SQL Editor
-- ============================================================

-- 1. TABELA
CREATE TABLE IF NOT EXISTS contribuintes (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email             TEXT NOT NULL UNIQUE,
  cnpj              TEXT,
  razao_social      TEXT,
  nome_fantasia     TEXT,
  telefone          TEXT,
  status            TEXT NOT NULL DEFAULT 'pendente_confirmacao'
                    CHECK (status IN ('pendente_confirmacao', 'ativo', 'inativo', 'bloqueado')),
  data_criacao      TIMESTAMPTZ DEFAULT now() NOT NULL,
  data_confirmacao  TIMESTAMPTZ,
  ultimo_acesso     TIMESTAMPTZ
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_contribuintes_user_id ON contribuintes(user_id);
CREATE INDEX IF NOT EXISTS idx_contribuintes_email ON contribuintes(email);
CREATE INDEX IF NOT EXISTS idx_contribuintes_cnpj ON contribuintes(cnpj);
CREATE INDEX IF NOT EXISTS idx_contribuintes_status ON contribuintes(status);

COMMENT ON TABLE contribuintes IS 'Cadastro de contribuintes (pessoas jurídicas) do Portal do Contribuinte';


-- 2. TRIGGER: Criar registro de contribuinte ao se registrar
CREATE OR REPLACE FUNCTION fn_create_contribuinte()
RETURNS TRIGGER AS $$
BEGIN
  -- Só cria se o metadata indicar que é contribuinte
  IF NEW.raw_user_meta_data->>'tipo' = 'contribuinte' THEN
    INSERT INTO contribuintes (user_id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_create_contribuinte ON auth.users;
CREATE TRIGGER trg_create_contribuinte
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION fn_create_contribuinte();


-- 3. RLS
ALTER TABLE contribuintes ENABLE ROW LEVEL SECURITY;

-- Contribuinte vê somente seus dados
CREATE POLICY "Contribuinte ve seus dados"
  ON contribuintes FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND perfil IN ('admin', 'fiscal', 'supervisor')
    )
  );

-- Contribuinte pode atualizar seus dados
CREATE POLICY "Contribuinte atualiza seus dados"
  ON contribuintes FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND perfil = 'admin'
    )
  );

-- Sistema pode inserir (via trigger)
CREATE POLICY "Sistema insere contribuinte"
  ON contribuintes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Somente admin pode deletar
CREATE POLICY "Admin deleta contribuinte"
  ON contribuintes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND perfil = 'admin'
    )
  );


-- 4. AUDITORIA
DROP TRIGGER IF EXISTS trg_audit_contribuintes ON contribuintes;
CREATE TRIGGER trg_audit_contribuintes
  AFTER INSERT OR UPDATE OR DELETE ON contribuintes
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
