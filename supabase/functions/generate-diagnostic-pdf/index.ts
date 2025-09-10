import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import * as nodemailer from "npm:nodemailer@6.9.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Types
interface Answer {
  id: number;
  value: 'Sim' | 'Não';
}

type Section = 
  | 'Estrutura Organizacional'
  | 'Processos Financeiros' 
  | 'Planejamento e Orçamento'
  | 'Custos e Precificação'
  | 'Indicadores e Relatórios'
  | 'Sistemas e Tecnologia'
  | 'Contabilidade e Fiscal'
  | 'Pessoas e Cultura';

interface Question {
  id: number;
  section: Section;
  text: string;
  type: 'boolean';
  dependsOn?: {
    id: number;
    value: 'Sim' | 'Não';
  };
}

// Questions data (replicated from frontend)
const questions: Question[] = [
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
  {"id":24,"section":"Sistemas e Tecnologia","text":"Se sim para a pergunta 23, o sistema possui API?","type":"boolean","dependsOn":{"id":23,"value":"Sim"}},
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

// Get summary statistics
function getSummaryStats(answers: Answer[]): {
  totalAnswered: number;
  yesCount: number;
  noCount: number;
  yesPercentage: number;
} {
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

// Build HTML (replicated from frontend)
function buildHtml(answers: Answer[]): string {
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
    
    @media print {
      body { padding: 20px; }
      .container { max-width: none; margin: 0; }
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

// Convert HTML to PDF using ConvertAPI
async function convertToPdf(html: string): Promise<Uint8Array> {
  const convertApiSecret = Deno.env.get('CONVERTAPI_SECRET');
  if (!convertApiSecret) {
    throw new Error('ConvertAPI secret not configured');
  }

  console.log('Converting HTML to PDF using ConvertAPI...');
  
  // Create form data with the HTML content
  const formData = new FormData();
  const htmlBlob = new Blob([html], { type: 'text/html' });
  formData.append('File', htmlBlob, 'document.html');
  formData.append('PageSize', 'A4');
  formData.append('MarginTop', '20');
  formData.append('MarginBottom', '20');
  formData.append('MarginLeft', '15');
  formData.append('MarginRight', '15');

  const response = await fetch(`https://v2.convertapi.com/convert/html/to/pdf?Secret=${convertApiSecret}`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('ConvertAPI error:', errorText);
    throw new Error(`ConvertAPI failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('ConvertAPI response:', JSON.stringify(result, null, 2));
  
  if (!result.Files || !result.Files[0]) {
    throw new Error('No PDF file returned from ConvertAPI');
  }

  // Download the PDF file
  const pdfUrl = result.Files[0].Url;
  console.log('Downloading PDF from:', pdfUrl);
  
  const pdfResponse = await fetch(pdfUrl);
  
  if (!pdfResponse.ok) {
    throw new Error('Failed to download PDF from ConvertAPI');
  }

  const pdfBuffer = new Uint8Array(await pdfResponse.arrayBuffer());
  console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');
  
  return pdfBuffer;
}

// Send email with PDF attachment using Gmail/Nodemailer
async function sendEmailWithPdf(pdfBuffer: Uint8Array): Promise<void> {
  const gmailUser = Deno.env.get('GMAIL_USER');
  const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD');
  
  if (!gmailUser || !gmailPassword) {
    throw new Error('Gmail credentials not configured');
  }

  console.log('Configuring Gmail transporter...');

  // Create transporter
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPassword
    }
  });

  const now = new Date();
  const formattedDate = now.toLocaleDateString('pt-BR');
  const fileName = `relatorio-diagnostico-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.pdf`;

  console.log('Sending email...');

  // Send email
  await transporter.sendMail({
    from: `"Diagnóstico Empresarial" <${gmailUser}>`,
    to: gmailUser, // Send to same email
    subject: `Relatório de Diagnóstico Empresarial - ${formattedDate}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #FF8C00;">
          <h1 style="color: #111827; margin-bottom: 10px;">📊 Diagnóstico Empresarial</h1>
          <p style="color: #6b7280; font-size: 16px;">Relatório de Análise da Maturidade da Gestão Financeira</p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #374151; margin-bottom: 15px;">📋 Resumo do Relatório</h2>
          <p style="color: #6b7280; line-height: 1.6; margin-bottom: 10px;">
            Olá! O relatório do diagnóstico empresarial foi gerado com sucesso.
          </p>
          <p style="color: #6b7280; line-height: 1.6; margin-bottom: 10px;">
            <strong>Data de geração:</strong> ${formattedDate}
          </p>
          <p style="color: #6b7280; line-height: 1.6;">
            O documento em anexo contém a análise completa das respostas fornecidas, incluindo estatísticas detalhadas e avaliação por seção.
          </p>
        </div>
        
        <div style="background: #fff7ed; padding: 20px; border-radius: 8px; border-left: 4px solid #FF8C00; margin-bottom: 20px;">
          <h3 style="color: #9a3412; margin-bottom: 10px;">📎 Arquivo em Anexo</h3>
          <p style="color: #9a3412; line-height: 1.6;">
            O arquivo PDF do relatório está anexado a este email com o nome: <strong>${fileName}</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 14px;">
            Relatório gerado automaticamente pelo sistema de Diagnóstico Empresarial
          </p>
          <p style="color: #9ca3af; font-size: 14px;">
            © ${now.getFullYear()} - Diagnóstico Empresarial
          </p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: fileName,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });

  console.log('Email sent successfully!');
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    console.log('Starting diagnostic PDF generation...');
    
    // Check if secrets are configured
    const convertApiSecret = Deno.env.get('CONVERTAPI_SECRET');
    const gmailUser = Deno.env.get('GMAIL_USER');
    const gmailPassword = Deno.env.get('GMAIL_APP_PASSWORD');
    
    console.log('Environment check:');
    console.log('- ConvertAPI secret:', convertApiSecret ? 'configured' : 'missing');
    console.log('- Gmail user:', gmailUser ? 'configured' : 'missing');
    console.log('- Gmail password:', gmailPassword ? 'configured' : 'missing');
    
    if (!convertApiSecret) {
      return new Response(JSON.stringify({
        ok: false,
        stage: 'config',
        error: 'ConvertAPI secret not configured. Please add your ConvertAPI secret in the Supabase dashboard.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    if (!gmailUser || !gmailPassword) {
      return new Response(JSON.stringify({
        ok: false,
        stage: 'config',
        error: 'Gmail credentials not configured. Please add your Gmail user and app password in the Supabase dashboard.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const body = await req.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'Answers array is required' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log(`Processing ${answers.length} answers...`);

    // Generate HTML
    console.log('Generating HTML report...');
    const html = buildHtml(answers);
    console.log('HTML generated successfully, length:', html.length, 'characters');
    
    // Convert to PDF
    console.log('Converting to PDF...');
    const pdfBuffer = await convertToPdf(html);
    
    // Send email
    console.log('Sending email...');
    await sendEmailWithPdf(pdfBuffer);

    console.log('Process completed successfully!');
    
    return new Response(JSON.stringify({
      ok: true,
      message: 'PDF gerado e enviado por email com sucesso!',
      emailId: `generated_${Date.now()}`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('Error in generate-diagnostic-pdf:', error);
    
    return new Response(JSON.stringify({
      ok: false,
      stage: 'processing',
      error: error.message || 'Failed to generate and send PDF',
      details: error.stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);