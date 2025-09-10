-- Criar tabela para armazenar respostas do quiz
CREATE TABLE public.quiz_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT,
  company_name TEXT,
  answers JSONB NOT NULL,
  total_answered INTEGER NOT NULL DEFAULT 0,
  yes_count INTEGER NOT NULL DEFAULT 0,
  no_count INTEGER NOT NULL DEFAULT 0,
  compliance_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX idx_quiz_responses_email ON public.quiz_responses(user_email);
CREATE INDEX idx_quiz_responses_created_at ON public.quiz_responses(created_at DESC);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para atualizar timestamp automaticamente
CREATE TRIGGER update_quiz_responses_updated_at
  BEFORE UPDATE ON public.quiz_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (apenas para admin ou sistema, não para usuários finais)
CREATE POLICY "Enable read access for all users" ON public.quiz_responses
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.quiz_responses
  FOR INSERT WITH CHECK (true);