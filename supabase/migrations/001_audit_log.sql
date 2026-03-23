-- ============================================================
-- SISTEMA DE AUDITORIA — VISA Maceió
-- Execute este SQL no Supabase SQL Editor
-- ============================================================

-- 1. TABELA AUDIT_LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tabela      TEXT NOT NULL,                        -- nome da tabela (estabelecimentos, licencas, etc.)
  registro_id UUID NOT NULL,                        -- ID do registro alterado
  usuario_id  UUID REFERENCES auth.users(id),       -- quem alterou
  acao        TEXT NOT NULL CHECK (acao IN ('CREATE', 'UPDATE', 'DELETE')),
  dados_antigos JSONB,                              -- snapshot antes da alteração
  dados_novos   JSONB,                              -- snapshot depois da alteração
  data_hora   TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_audit_log_tabela      ON audit_log(tabela);
CREATE INDEX IF NOT EXISTS idx_audit_log_registro_id ON audit_log(registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_usuario_id  ON audit_log(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_data_hora   ON audit_log(data_hora DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_acao        ON audit_log(acao);

-- Comentário na tabela
COMMENT ON TABLE audit_log IS 'Registro de auditoria — todas as alterações em tabelas monitoradas';


-- 2. FUNÇÃO GENÉRICA DE TRIGGER
-- ============================================================
-- Esta função funciona para QUALQUER tabela que tenha campo "user_id" ou
-- receba o usuário via current_setting('app.current_user_id').
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  v_usuario_id UUID;
  v_registro_id UUID;
  v_acao TEXT;
  v_dados_antigos JSONB;
  v_dados_novos JSONB;
BEGIN
  -- Tenta capturar o user_id do registro ou da sessão
  BEGIN
    v_usuario_id := current_setting('request.jwt.claims', true)::json->>'sub';
  EXCEPTION WHEN OTHERS THEN
    v_usuario_id := NULL;
  END;

  -- Fallback: tenta pegar user_id do próprio registro
  IF v_usuario_id IS NULL THEN
    IF TG_OP = 'DELETE' THEN
      v_usuario_id := (OLD.user_id)::UUID;
    ELSE
      v_usuario_id := (NEW.user_id)::UUID;
    END IF;
  END IF;

  -- Define ação, dados antigos/novos e registro_id
  -- Suporta tabelas com PK "id" ou "user_id"
  CASE TG_OP
    WHEN 'INSERT' THEN
      v_acao := 'CREATE';
      v_dados_antigos := NULL;
      v_dados_novos := to_jsonb(NEW);
      v_registro_id := COALESCE(
        (to_jsonb(NEW)->>'id')::UUID,
        (to_jsonb(NEW)->>'user_id')::UUID
      );
    WHEN 'UPDATE' THEN
      v_acao := 'UPDATE';
      v_dados_antigos := to_jsonb(OLD);
      v_dados_novos := to_jsonb(NEW);
      v_registro_id := COALESCE(
        (to_jsonb(NEW)->>'id')::UUID,
        (to_jsonb(NEW)->>'user_id')::UUID
      );
    WHEN 'DELETE' THEN
      v_acao := 'DELETE';
      v_dados_antigos := to_jsonb(OLD);
      v_dados_novos := NULL;
      v_registro_id := COALESCE(
        (to_jsonb(OLD)->>'id')::UUID,
        (to_jsonb(OLD)->>'user_id')::UUID
      );
  END CASE;

  -- Insere no audit_log
  INSERT INTO audit_log (tabela, registro_id, usuario_id, acao, dados_antigos, dados_novos)
  VALUES (TG_TABLE_NAME, v_registro_id, v_usuario_id, v_acao, v_dados_antigos, v_dados_novos);

  -- Retorna o registro (obrigatório para triggers)
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. TRIGGERS NAS TABELAS
-- ============================================================

-- Estabelecimentos
DROP TRIGGER IF EXISTS trg_audit_estabelecimentos ON estabelecimentos;
CREATE TRIGGER trg_audit_estabelecimentos
  AFTER INSERT OR UPDATE OR DELETE ON estabelecimentos
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- Licenças
DROP TRIGGER IF EXISTS trg_audit_licencas ON licencas;
CREATE TRIGGER trg_audit_licencas
  AFTER INSERT OR UPDATE OR DELETE ON licencas
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- Inspeções
DROP TRIGGER IF EXISTS trg_audit_inspecoes ON inspecoes;
CREATE TRIGGER trg_audit_inspecoes
  AFTER INSERT OR UPDATE OR DELETE ON inspecoes
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();


-- 4. RLS (Row Level Security)
-- ============================================================
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Permite leitura para usuários autenticados
CREATE POLICY "Usuários autenticados podem ler audit_log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (true);

-- Somente o sistema (triggers) pode inserir
CREATE POLICY "Somente sistema pode inserir audit_log"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (false);

-- Ninguém pode atualizar ou deletar (imutável)
CREATE POLICY "Ninguém pode atualizar audit_log"
  ON audit_log FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Ninguém pode deletar audit_log"
  ON audit_log FOR DELETE
  TO authenticated
  USING (false);
