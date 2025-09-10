import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import * as nodemailer from "npm:nodemailer@6.9.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Types
interface Answer {
  id: number;
  value: 'Sim' | 'Não';
}

interface RequestBody {
  email: string;
  name: string;
  company?: string;
  answers: Answer[];
}

// Questions data (duplicated to avoid dependencies)
const questions = [
  {"id":1,"section":"Estrutura Organizacional","text":"A empresa possui organograma formalizado?","type":"boolean"},
  {"id":2,"section":"Estrutura Organizacional","text":"Existem responsáveis definidos para cada área (Financeiro, RH, Contábil, etc.)?","type":"boolean"},
  {"id":3,"section":"Estrutura Organizacional","text":"Existem rotinas e processos administrativos documentados?","type":"boolean"},
  {"id":4,"section":"Estrutura Organizacional","text":"A empresa possui mais de uma unidade ou filial?","type":"boolean"},
  {"id":5,"section":"Processos Financeiros","text":"A empresa possui controle diário do fluxo de caixa?","type":"boolean"},
  {"id":6,"section":"Processos Financeiros","text":"Existe conciliação bancária feita regularmente?","type":"boolean"},
  {"id":7,"section":"Processos Financeiros","text":"Os lançamentos financeiros seguem um plano de contas padronizado?","type":"boolean"},
  {"id":8,"section":"Processos Financeiros","text":"Existe controle sistemático das contas a pagar?","type":"boolean"},
  {"id":9,"section":"Processos Financeiros","text":"Existe controle sistemático das contas a receber?","type":"boolean"},
  {"id":10,"section":"Processos Financeiros","text":"A empresa realiza fechamento financeiro mensal?","type":"boolean"},
  {"id":11,"section":"Planejamento e Orçamento","text":"Existe orçamento anual elaborado?","type":"boolean"},
  {"id":12,"section":"Planejamento e Orçamento","text":"O orçamento é acompanhado mensalmente?","type":"boolean"},
  {"id":13,"section":"Planejamento e Orçamento","text":"Existem metas financeiras definidas?","type":"boolean"},
  {"id":14,"section":"Planejamento e Orçamento","text":"Existe planejamento estratégico formalizado?","type":"boolean"},
  {"id":15,"section":"Custos e Precificação","text":"A empresa controla os custos fixos e variáveis separadamente?","type":"boolean"},
  {"id":16,"section":"Custos e Precificação","text":"Existe apuração de margem de contribuição por produto ou serviço?","type":"boolean"},
  {"id":17,"section":"Custos e Precificação","text":"Existe metodologia definida para precificação?","type":"boolean"},
  {"id":18,"section":"Custos e Precificação","text":"Existe rateio de despesas indiretas por centro de custo?","type":"boolean"},
  {"id":19,"section":"Indicadores e Relatórios","text":"A empresa acompanha indicadores de desempenho (KPIs)?","type":"boolean"},
  {"id":20,"section":"Indicadores e Relatórios","text":"Os gestores recebem relatórios financeiros regularmente?","type":"boolean"},
  {"id":21,"section":"Indicadores e Relatórios","text":"Os relatórios são utilizados para tomada de decisão?","type":"boolean"},
  {"id":22,"section":"Indicadores e Relatórios","text":"Existe rotina de análise de resultados com os gestores?","type":"boolean"},
  {"id":23,"section":"Sistemas e Tecnologia","text":"A empresa utiliza um sistema ERP integrado?","type":"boolean"},
  {"id":24,"section":"Sistemas e Tecnologia","text":"Se sim para a pergunta 23, o sistema possui API?","type":"boolean"},
  {"id":25,"section":"Sistemas e Tecnologia","text":"Os dados financeiros são extraídos do sistema com facilidade?","type":"boolean"},
  {"id":26,"section":"Sistemas e Tecnologia","text":"A equipe utiliza planilhas manuais para complementar o sistema?","type":"boolean"},
  {"id":27,"section":"Sistemas e Tecnologia","text":"Existe automatização de relatórios gerenciais?","type":"boolean"},
  {"id":28,"section":"Contabilidade e Fiscal","text":"A contabilidade está atualizada mensalmente?","type":"boolean"},
  {"id":29,"section":"Contabilidade e Fiscal","text":"Existe integração entre a contabilidade e o financeiro?","type":"boolean"},
  {"id":30,"section":"Contabilidade e Fiscal","text":"As demonstrações contábeis são utilizadas para análise interna?","type":"boolean"},
  {"id":31,"section":"Contabilidade e Fiscal","text":"A empresa realiza planejamento tributário?","type":"boolean"},
  {"id":32,"section":"Pessoas e Cultura","text":"Os responsáveis pelas áreas têm conhecimento básico de finanças?","type":"boolean"},
  {"id":33,"section":"Pessoas e Cultura","text":"Existe comunicação clara entre os setores da empresa?","type":"boolean"},
  {"id":34,"section":"Pessoas e Cultura","text":"Os gestores têm autonomia para decisões financeiras?","type":"boolean"},
  {"id":35,"section":"Pessoas e Cultura","text":"A cultura da empresa é orientada a resultados?","type":"boolean"}
];

// Statistics functions
function getSummaryStats(answers: Answer[]) {
  const totalAnswered = answers.length;
  const yesCount = answers.filter(answer => answer.value === 'Sim').length;
  const noCount = answers.filter(answer => answer.value === 'Não').length;
  const yesPercentage = totalAnswered > 0 ? Math.round((yesCount / totalAnswered) * 100) : 0;
  
  return {
    totalAnswered,
    yesCount,
    noCount,
    yesPercentage
  };
}

// Generate HTML content
function generateHtmlContent(answers: Answer[], userData: { email: string; name: string; company?: string }): string {
  const stats = getSummaryStats(answers);
  const now = new Date();
  const formattedDate = now.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const tableRows = questions.map((question) => {
    const answer = answers.find(a => a.id === question.id);
    const answerIcon = answer?.value === 'Sim' ? '✅' : answer?.value === 'Não' ? '❌' : '⚪';
    const answerText = answer?.value || 'Não respondida';

    return `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px; text-align: center; font-weight: 600; color: #6b7280;">${question.id}</td>
      <td style="padding: 12px 8px;">
        <span style="display: inline-block; background-color: #f3f4f6; color: #374151; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">
          ${question.section}
        </span>
      </td>
      <td style="padding: 12px 8px; color: #374151; line-height: 1.4;">${question.text}</td>
      <td style="padding: 12px 8px; text-align: center; font-weight: 600;">
        <span style="display: inline-flex; align-items: center; justify-content: center;">
          ${answerIcon}
        </span>
      </td>
    </tr>`;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório do Diagnóstico Empresarial</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      line-height: 1.6;
      color: #111827;
      background-color: #ffffff;
      padding: 40px 20px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 30px;
      border-bottom: 3px solid #FF8C00;
    }
    
    .header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #111827;
      margin-bottom: 8px;
      letter-spacing: -0.025em;
    }
    
    .header p {
      font-size: 1.125rem;
      color: #6b7280;
      margin-bottom: 20px;
    }
    
    .header .meta {
      display: flex;
      justify-content: center;
      gap: 30px;
      font-size: 0.875rem;
      color: #9ca3af;
    }
    
    .user-info {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid #FF8C00;
    }
    
    .user-info h3 {
      color: #FF8C00;
      margin-bottom: 15px;
      font-size: 1.25rem;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #f9fafb, #f3f4f6);
      padding: 24px;
      border-radius: 12px;
      text-align: center;
      border: 1px solid #e5e7eb;
    }
    
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 4px;
    }
    
    .stat-value.primary { color: #FF8C00; }
    .stat-value.success { color: #059669; }
    .stat-value.neutral { color: #6b7280; }
    
    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
    }
    
    .table-container {
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }
    
    .table-header {
      background: linear-gradient(135deg, #FF8C00, #FF7700);
      color: white;
      padding: 20px;
      text-align: center;
    }
    
    .table-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th {
      background-color: #f9fafb;
      padding: 16px 8px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #e5e7eb;
    }
    
    th:first-child,
    th:last-child {
      text-align: center;
    }
    
    td {
      font-size: 0.875rem;
    }
    
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    
    tr:hover {
      background-color: #f3f4f6;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Relatório do Diagnóstico Empresarial</h1>
      <p>Análise da Maturidade da Gestão Financeira</p>
      <div class="meta">
        <span>📅 ${formattedDate}</span>
        <span>🕐 ${formattedTime}</span>
        <span>📊 ${stats.totalAnswered} respostas</span>
      </div>
    </div>

    <!-- User Info -->
    <div class="user-info">
      <h3>👤 Informações do Respondente</h3>
      <p><strong>Nome:</strong> ${userData.name}</p>
      <p><strong>Email:</strong> ${userData.email}</p>
      ${userData.company ? `<p><strong>Empresa:</strong> ${userData.company}</p>` : ''}
    </div>

    <!-- Statistics -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${stats.totalAnswered}</div>
        <div class="stat-label">Perguntas Respondidas</div>
      </div>
      <div class="stat-card">
        <div class="stat-value success">${stats.yesCount}</div>
        <div class="stat-label">Respostas "Sim"</div>
      </div>
      <div class="stat-card">
        <div class="stat-value neutral">${stats.noCount}</div>
        <div class="stat-label">Respostas "Não"</div>
      </div>
      <div class="stat-card">
        <div class="stat-value primary">${stats.yesPercentage}%</div>
        <div class="stat-label">Taxa de Conformidade</div>
      </div>
    </div>

    <!-- Results Table -->
    <div class="table-container">
      <div class="table-header">
        <h2>📝 Respostas do Quiz de Diagnóstico</h2>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Seção</th>
            <th>Pergunta</th>
            <th>Resposta</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Relatório gerado automaticamente pelo sistema de Diagnóstico Empresarial</p>
      <p>© ${now.getFullYear()} - Diagnóstico Empresarial</p>
    </div>
  </div>
</body>
</html>`;
}

// Send emails using Gmail
async function sendEmails(userData: { email: string; name: string; company?: string }, answers: Answer[], htmlContent: string) {
  const gmailUser = Deno.env.get('GMAIL_USER');
  const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD');
  
  if (!gmailUser || !gmailPassword) {
    throw new Error('Gmail credentials not configured');
  }

  console.log('Setting up Gmail transporter...');
  
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword
    }
  });

  const now = new Date();
  const formattedDate = now.toLocaleDateString('pt-BR');
  const stats = getSummaryStats(answers);

  // Email de confirmação para o usuário (enviado apenas para jmarcss.rm@gmail.com)
  console.log('Sending confirmation email to admin with user data...');
  await transporter.sendMail({
    from: `"Diagnóstico Empresarial" <${gmailUser}>`,
    to: 'jmarcss.rm@gmail.com',
    subject: `Nova Resposta do Diagnóstico - ${userData.name} - ${formattedDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #FF8C00;">
          <h1 style="color: #111827; margin-bottom: 10px;">🔔 Nova Resposta do Diagnóstico</h1>
          <p style="color: #6b7280; font-size: 16px;">Notificação do Sistema</p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #374151; margin-bottom: 15px;">👤 Dados do Respondente</h2>
          <p><strong>Nome:</strong> ${userData.name}</p>
          <p><strong>Email:</strong> ${userData.email}</p>
          ${userData.company ? `<p><strong>Empresa:</strong> ${userData.company}</p>` : ''}
          <p><strong>Data:</strong> ${formattedDate}</p>
        </div>
        
        <p style="color: #374151; margin-bottom: 20px;">
          Uma nova resposta do diagnóstico empresarial foi recebida.
        </p>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #374151; margin-bottom: 15px;">📋 Resumo dos Resultados</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="text-align: center; padding: 15px; background: white; border-radius: 6px;">
              <div style="font-size: 24px; font-weight: bold; color: #FF8C00;">${stats.totalAnswered}</div>
              <div style="font-size: 12px; color: #6b7280;">Perguntas Respondidas</div>
            </div>
            <div style="text-align: center; padding: 15px; background: white; border-radius: 6px;">
              <div style="font-size: 24px; font-weight: bold; color: #059669;">${stats.yesCount}</div>
              <div style="font-size: 12px; color: #6b7280;">Respostas "Sim"</div>
            </div>
            <div style="text-align: center; padding: 15px; background: white; border-radius: 6px;">
              <div style="font-size: 24px; font-weight: bold; color: #6b7280;">${stats.noCount}</div>
              <div style="font-size: 12px; color: #6b7280;">Respostas "Não"</div>
            </div>
            <div style="text-align: center; padding: 15px; background: white; border-radius: 6px;">
              <div style="font-size: 24px; font-weight: bold; color: #FF8C00;">${stats.yesPercentage}%</div>
              <div style="font-size: 12px; color: #6b7280;">Taxa de Conformidade</div>
            </div>
          </div>
        </div>
        
        <div style="background: #fff7ed; padding: 20px; border-radius: 8px; border-left: 4px solid #FF8C00; margin-bottom: 20px;">
          <h3 style="color: #FF8C00; margin-bottom: 10px;">✅ Próximos Passos</h3>
          <p style="color: #6b7280; margin-bottom: 0;">
            Suas respostas foram enviadas para nossa equipe de análise. Em breve entraremos em contato com insights e recomendações personalizadas para melhorar a gestão financeira da sua empresa.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px;">
            Este email foi gerado automaticamente pelo sistema de Diagnóstico Empresarial<br>
            Se você tem dúvidas, entre em contato conosco.
          </p>
        </div>
      </div>
    `
  });

  // Email completo para jmarcss.rm@gmail.com
  console.log('Sending full report email to admin...');
  await transporter.sendMail({
    from: `"Sistema Diagnóstico" <${gmailUser}>`,
    to: 'jmarcss.rm@gmail.com',
    subject: `Nova Resposta do Diagnóstico - ${userData.name} - ${formattedDate}`,
    html: htmlContent
  });
}

// Save response to database
async function saveResponse(userData: { email: string; name: string; company?: string }, answers: Answer[], stats: any) {
  try {
    console.log('Saving response to database...');
    
    const { data, error } = await supabase
      .from('quiz_responses')
      .insert({
        user_email: userData.email,
        user_name: userData.name,
        company_name: userData.company,
        answers: answers,
        total_answered: stats.totalAnswered,
        yes_count: stats.yesCount,
        no_count: stats.noCount,
        compliance_percentage: stats.yesPercentage
      });

    if (error) {
      console.error('Database save error:', error);
      throw error;
    }

    console.log('Response saved successfully to database');
    return data;
  } catch (error) {
    console.error('Failed to save to database:', error);
    throw error;
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing diagnostic email request...');
    
    const requestBody: RequestBody = await req.json();
    const { email, name, company, answers } = requestBody;

    console.log(`Processing request for ${name} (${email})`);

    // Validate request
    if (!email || !name || !answers || answers.length === 0) {
      throw new Error('Missing required fields: email, name, or answers');
    }

    const stats = getSummaryStats(answers);
    console.log(`Stats: ${stats.totalAnswered} total, ${stats.yesCount} yes, ${stats.yesPercentage}% compliance`);

    // Generate HTML content
    const htmlContent = generateHtmlContent(answers, { email, name, company });
    console.log('HTML content generated successfully');

    // Save to database
    await saveResponse({ email, name, company }, answers, stats);

    // Send emails
    await sendEmails({ email, name, company }, answers, htmlContent);
    console.log('All emails sent successfully');

    return new Response(JSON.stringify({
      ok: true,
      message: 'Diagnóstico enviado com sucesso! Você receberá um email de confirmação e nossa equipe receberá suas respostas para análise.'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in send-diagnostic-email function:', error);
    
    return new Response(JSON.stringify({
      ok: false,
      error: error.message || 'Erro interno do servidor',
      details: error.toString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};

serve(handler);