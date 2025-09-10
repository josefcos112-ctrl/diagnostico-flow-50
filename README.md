# Diagnóstico Empresarial

Uma aplicação premium para avaliação da maturidade da gestão financeira empresarial, com questionário de 35 perguntas, geração de relatório em PDF e envio automático por e-mail.

## 🚀 Características

- **Interface Premium**: Design minimalista inspirado em Apple/Nike com acentos em laranja
- **Quiz Interativo**: 35 perguntas estratégicas com navegação fluida e progresso visual
- **Auto-save**: Persistência automática no localStorage
- **Relatório PDF**: Geração automática via ConvertAPI
- **Envio por E-mail**: Integração com Resend para entrega automática
- **Responsivo**: Otimizado para desktop e mobile
- **Acessibilidade**: Foco em usabilidade e navegação por teclado

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** + **TypeScript**
- **Vite** para desenvolvimento rápido
- **Tailwind CSS** + **shadcn/ui** para componentes
- **Framer Motion** para animações suaves
- **Zustand** para gerenciamento de estado
- **Lucide React** para ícones
- **React Router DOM** para navegação

### Backend & APIs
- **ConvertAPI** para conversão HTML → PDF
- **Resend** para envio de e-mails
- **Zod** para validação de dados

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ e npm/pnpm
- Conta ConvertAPI (para geração de PDF)
- Conta Resend (para envio de e-mails)

### Setup Local

1. **Clone o projeto**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd diagnostico-empresarial
   ```

2. **Instale as dependências**
   ```bash
   pnpm install
   # ou
   npm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   
   Preencha as variáveis no arquivo `.env`:
   ```env
   CONVERTAPI_SECRET=your_convertapi_secret_here
   RESEND_API_KEY=your_resend_api_key_here
   MAIL_FROM=Seu Nome <no-reply@seudominio.com>
   MAIL_TO=destinatario@gmail.com
   ```

4. **Execute o projeto**
   ```bash
   pnpm dev
   # ou  
   npm run dev
   ```

5. **Acesse a aplicação**
   - Frontend: http://localhost:8080
   - Página do diagnóstico: http://localhost:8080/diagnostico

## 🔧 Configuração das APIs

### ConvertAPI
1. Crie conta em [ConvertAPI](https://www.convertapi.com/)
2. Obtenha sua chave secreta no dashboard
3. Configure `CONVERTAPI_SECRET` no .env

### Resend
1. Crie conta em [Resend](https://resend.com/)
2. Crie uma API key no dashboard
3. Configure `RESEND_API_KEY` no .env
4. Configure o domínio remetente em `MAIL_FROM`

## 📋 Funcionalidades

### Questionário
- 35 perguntas divididas em 8 seções estratégicas
- Navegação com botões Voltar/Próxima/Pular
- Barra de progresso visual
- Auto-save no localStorage
- Lógica condicional (Q24 depende de Q23)

### Seções do Diagnóstico
1. **Estrutura Organizacional** (4 perguntas)
2. **Processos Financeiros** (6 perguntas)
3. **Planejamento e Orçamento** (4 perguntas)
4. **Custos e Precificação** (4 perguntas)
5. **Indicadores e Relatórios** (4 perguntas)
6. **Sistemas e Tecnologia** (5 perguntas)
7. **Contabilidade e Fiscal** (4 perguntas)
8. **Pessoas e Cultura** (4 perguntas)

### Relatório PDF
- Template profissional responsivo
- Estatísticas resumo (total, % conformidade)
- Tabela completa de perguntas e respostas
- Marca visual consistente
- Otimizado para impressão

## 🧪 Testes

### Teste Manual Rápido
1. Acesse `/diagnostico`
2. Responda algumas perguntas
3. Complete o quiz
4. Insira seu e-mail na tela de resumo
5. Clique em "Gerar PDF e Enviar por E-mail"
6. Verifique se recebeu o e-mail com anexo

### Teste da API (quando implementada)
```bash
curl -X POST http://localhost:8080/api/diagnostico \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@email.com",
    "subject": "Teste do Diagnóstico",
    "answers": [
      {"id": 1, "value": "Sim"},
      {"id": 2, "value": "Não"}
    ]
  }'
```

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente no dashboard
3. Deploy automático a cada push

### Outras Plataformas
- **Netlify**: Configure build command `npm run build`
- **Railway**: Adicione variáveis de ambiente
- **Heroku**: Configure Procfile se necessário

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes shadcn/ui
│   ├── QuizCard.tsx    # Card de pergunta
│   └── QuizSummary.tsx # Resumo final
├── data/
│   └── questions.ts    # Dados das perguntas
├── hooks/              # Custom hooks  
├── lib/
│   ├── api.ts         # Cliente da API
│   ├── buildHtml.ts   # Gerador de HTML
│   ├── convertapi.ts  # Cliente ConvertAPI
│   └── utils.ts       # Utilitários
├── pages/
│   ├── Index.tsx      # Página inicial
│   ├── Diagnostico.tsx # Página do quiz
│   └── NotFound.tsx   # 404
├── store/
│   └── quiz.ts        # Estado global (Zustand)
└── styles/
    └── index.css      # Design system
```

## 🎨 Design System

### Cores Principais
- **Brand Orange**: `#FF8C00` - Acentos e CTAs
- **Neutros**: Escala de cinzas para textos e backgrounds
- **Success**: Verde para respostas positivas
- **Gradientes**: Superfícies e elementos hero

### Tipografia
- **Display**: Títulos e headlines (SF Pro Display)
- **Body**: Textos corridos (SF Pro Text)
- **Weights**: 400 (regular), 600 (semibold), 700 (bold)

### Componentes
- Botões com variantes `default`, `outline`, `ghost`
- Cards com shadows suaves
- Badges para categorização
- Progress bar customizada
- Tabelas responsivas

## 🔒 Segurança

- Validação de dados com Zod
- Sanitização de HTML
- Rate limiting (implementar conforme necessário)
- Variáveis de ambiente para secrets
- Headers de segurança (CSP, CORS)

## 📊 Analytics e Monitoramento

### Métricas Importantes
- Taxa de conclusão do quiz
- Tempo médio de resposta
- Abandono por seção
- Sucesso na geração de PDF
- Entregas de e-mail

### Logs
- Geração de PDF (tamanho, tempo)
- Envios de e-mail (status, destinatário)
- Erros de API (stage, mensagem)

## 🆘 Troubleshooting

### Problemas Comuns

**PDF não gera**
- Verifique `CONVERTAPI_SECRET`
- Teste conexão com ConvertAPI
- Analise logs de erro

**E-mail não enviado**
- Confirme `RESEND_API_KEY`
- Verifique domínio remetente
- Teste com e-mail simples

**Quiz não salva**
- Verifique localStorage no browser
- Confirme permissões de armazenamento
- Teste em navegador privado

**Erros de Build**
- Execute `pnpm clean` e reinstale
- Verifique versões do Node.js
- Analise mensagens do TypeScript

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Abra uma issue no GitHub
- E-mail: jmarcss.rm@gmail.com

---

**Diagnóstico Empresarial** - Transformando dados em insights estratégicos 🚀