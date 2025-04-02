
-- Adiciona uma função para promover automaticamente o primeiro usuário como administrador

-- Criando uma tabela para controle de "flags" do sistema
CREATE TABLE IF NOT EXISTS public.system_flags (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Função para promover o primeiro usuário como administrador
CREATE OR REPLACE FUNCTION public.make_first_user_admin()
RETURNS TRIGGER AS $$
DECLARE
  first_admin_set BOOLEAN;
BEGIN
  -- Verifica se já foi definido o primeiro administrador
  SELECT EXISTS (
    SELECT 1 FROM public.system_flags WHERE key = 'first_admin_set'
  ) INTO first_admin_set;
  
  IF NOT first_admin_set THEN
    -- Define o novo usuário como administrador
    UPDATE public.profiles 
    SET role = 'admin'::user_role 
    WHERE id = NEW.id;
    
    -- Marca que o primeiro admin já foi definido
    INSERT INTO public.system_flags (key, value)
    VALUES ('first_admin_set', '{"set": true}');
    
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Adiciona o trigger apenas se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_first_user_as_admin'
  ) THEN
    CREATE TRIGGER set_first_user_as_admin
      AFTER INSERT ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.make_first_user_admin();
  END IF;
END
$$;

-- Tentar promover o primeiro usuário existente caso ainda não tenha um admin
DO $$
DECLARE
  first_admin_set BOOLEAN;
  first_user_id UUID;
BEGIN
  -- Verifica se já foi definido o primeiro administrador
  SELECT EXISTS (
    SELECT 1 FROM public.system_flags WHERE key = 'first_admin_set'
  ) INTO first_admin_set;
  
  IF NOT first_admin_set THEN
    -- Pega o ID do primeiro usuário
    SELECT id INTO first_user_id FROM public.profiles ORDER BY created_at LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
      -- Define o usuário como administrador
      UPDATE public.profiles 
      SET role = 'admin'::user_role 
      WHERE id = first_user_id;
      
      -- Marca que o primeiro admin já foi definido
      INSERT INTO public.system_flags (key, value)
      VALUES ('first_admin_set', '{"set": true}');
    END IF;
  END IF;
END
$$;
