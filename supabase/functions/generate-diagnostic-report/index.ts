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

interface RequestBody {
  email: string;
  name: string;
  company?: string;
  answers: Answer[];
}

// Questions data
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

// Generate PDF using ConvertAPI (HTML to PDF)
async function generatePDF(answers: Answer[], userData: { email: string; name: string; company?: string }): Promise<Uint8Array> {
  const stats = getSummaryStats(answers);
  const now = new Date();
  
  // Generate HTML content
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Relatório do Diagnóstico Empresarial</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; }
        .title { color: #FF8C00; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .subtitle { color: #6b7280; font-size: 16px; }
        .user-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
        .stat-box { text-align: center; padding: 20px; background: #f0f9ff; border-radius: 8px; }
        .stat-number { font-size: 24px; font-weight: bold; color: #FF8C00; }
        .stat-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
        .section-title { color: #FF8C00; font-size: 18px; margin: 30px 0 15px 0; border-bottom: 2px solid #FF8C00; padding-bottom: 5px; }
        .questions-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .questions-table th { background: #f9fafb; padding: 12px; text-align: left; border: 1px solid #e5e7eb; font-weight: bold; }
        .questions-table td { padding: 10px 12px; border: 1px solid #e5e7eb; }
        .questions-table tr:nth-child(even) { background: #f9fafb; }
        .answer-yes { color: #059669; font-weight: bold; }
        .answer-no { color: #dc2626; font-weight: bold; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">RELATÓRIO DO DIAGNÓSTICO EMPRESARIAL</div>
        <div class="subtitle">Análise da Maturidade da Gestão Financeira</div>
    </div>
    
    <div class="user-info">
        <h3>Informações do Respondente</h3>
        <p><strong>Nome:</strong> ${userData.name}</p>
        <p><strong>Email:</strong> ${userData.email}</p>
        ${userData.company ? `<p><strong>Empresa:</strong> ${userData.company}</p>` : ''}
        <p><strong>Data:</strong> ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}</p>
    </div>
    
    <div class="section-title">ESTATÍSTICAS DO DIAGNÓSTICO</div>
    <div class="stats">
        <div class="stat-box">
            <div class="stat-number">${stats.totalAnswered}</div>
            <div class="stat-label">Perguntas Respondidas</div>
        </div>
        <div class="stat-box">
            <div class="stat-number">${stats.yesCount}</div>
            <div class="stat-label">Respostas "Sim"</div>
        </div>
        <div class="stat-box">
            <div class="stat-number">${stats.noCount}</div>
            <div class="stat-label">Respostas "Não"</div>
        </div>
        <div class="stat-box">
            <div class="stat-number">${stats.yesPercentage}%</div>
            <div class="stat-label">Taxa de Conformidade</div>
        </div>
    </div>
    
    <div class="section-title">RESPOSTAS DETALHADAS</div>
    <table class="questions-table">
        <thead>
            <tr>
                <th style="width: 5%;">#</th>
                <th style="width: 25%;">Seção</th>
                <th style="width: 60%;">Pergunta</th>
                <th style="width: 10%;">Resposta</th>
            </tr>
        </thead>
        <tbody>
            ${questions.map((question, index) => {
              const answer = answers.find(a => a.id === question.id);
              const answerText = answer?.value || 'N/A';
              const answerClass = answer?.value === 'Sim' ? 'answer-yes' : 'answer-no';
              const answerEmoji = answer?.value === 'Sim' ? '✓' : '✗';
              
              return `
                <tr>
                    <td>${question.id}</td>
                    <td>${question.section}</td>
                    <td>${question.text}</td>
                    <td class="${answerClass}">${answerEmoji} ${answerText}</td>
                </tr>
              `;
            }).join('')}
        </tbody>
    </table>
    
    <div class="footer">
        © ${now.getFullYear()} - Diagnóstico Empresarial - Relatório gerado automaticamente
    </div>
</body>
</html>
  `;

  // Convert HTML to PDF using ConvertAPI
  const convertApiSecret = Deno.env.get('CONVERTAPI_SECRET');
  if (!convertApiSecret) {
    throw new Error('ConvertAPI secret not configured');
  }

  console.log('Converting HTML to PDF using ConvertAPI...');
  
  // Step 1: Upload HTML content
  const uploadResponse = await fetch(
    `https://v2.convertapi.com/upload?filename=diagnostico.html&Secret=${convertApiSecret}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
      body: htmlContent,
    }
  );

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
  }

  const uploadResult = await uploadResponse.json();
  console.log('HTML uploaded successfully:', uploadResult.Url);

  // Step 2: Convert HTML to PDF
  const formData = new FormData();
  formData.append('File', uploadResult.Url);
  formData.append('StoreFile', 'true');
  formData.append('FileName', 'diagnostico.pdf');

  const convertResponse = await fetch(
    `https://v2.convertapi.com/convert/html/to/pdf?Secret=${convertApiSecret}`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!convertResponse.ok) {
    throw new Error(`Conversion failed: ${convertResponse.status} ${convertResponse.statusText}`);
  }

  const convertResult = await convertResponse.json();
  console.log('PDF converted successfully:', convertResult.Files[0]?.Url);

  if (!convertResult.Files || convertResult.Files.length === 0) {
    throw new Error('No PDF file generated');
  }

  // Step 3: Download the PDF
  const pdfResponse = await fetch(convertResult.Files[0].Url);
  if (!pdfResponse.ok) {
    throw new Error(`PDF download failed: ${pdfResponse.status} ${pdfResponse.statusText}`);
  }

  const pdfBuffer = new Uint8Array(await pdfResponse.arrayBuffer());
  console.log(`PDF downloaded successfully: ${pdfBuffer.length} bytes`);

  return pdfBuffer;
}

// Send email using Gmail
async function sendEmails(pdfBuffer: Uint8Array, userData: { email: string; name: string; company?: string }, answers: Answer[]) {
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
  const fileName = `diagnostico-empresarial-${userData.name.replace(/\s+/g, '-').toLowerCase()}-${formattedDate.replace(/\//g, '-')}.pdf`;

  // Email para o usuário
  console.log('Sending email to user...');
  await transporter.sendMail({
    from: `"Diagnóstico Empresarial" <${gmailUser}>`,
    to: userData.email,
    subject: `Seu Relatório de Diagnóstico Empresarial - ${formattedDate}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #FF8C00;">
          <h1 style="color: #111827; margin-bottom: 10px;">📊 Diagnóstico Empresarial Concluído!</h1>
          <p style="color: #6b7280; font-size: 16px;">Análise da Maturidade da Gestão Financeira</p>
        </div>
        
        <p style="color: #374151; margin-bottom: 20px;">Olá <strong>${userData.name}</strong>,</p>
        
        <p style="color: #374151; margin-bottom: 20px;">
          Obrigado por completar nosso diagnóstico empresarial! Seu relatório personalizado está anexado a este email.
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
          <h3 style="color: #FF8C00; margin-bottom: 10px;">📎 Relatório Anexado</h3>
          <p style="color: #6b7280; margin-bottom: 0;">
            O documento PDF em anexo contém a análise completa das suas respostas com insights detalhados para melhorar a maturidade da gestão financeira da sua empresa.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px;">
            Este email foi gerado automaticamente pelo sistema de Diagnóstico Empresarial<br>
            Se você tem dúvidas sobre o relatório, entre em contato conosco.
          </p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: fileName,
        content: Buffer.from(pdfBuffer),
        contentType: 'application/pdf'
      }
    ]
  });

  // Email de notificação para jmarcss.rm@gmail.com
  console.log('Sending notification email...');
  await transporter.sendMail({
    from: `"Sistema Diagnóstico" <${gmailUser}>`,
    to: 'jmarcss.rm@gmail.com',
    subject: `Nova Resposta de Diagnóstico - ${userData.name} - ${formattedDate}`,
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
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #374151; margin-bottom: 15px;">📊 Resumo das Respostas</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div style="text-align: center; padding: 15px; background: white; border-radius: 6px;">
              <div style="font-size: 18px; font-weight: bold; color: #FF8C00;">${stats.totalAnswered}</div>
              <div style="font-size: 11px; color: #6b7280;">Total Respondidas</div>
            </div>
            <div style="text-align: center; padding: 15px; background: white; border-radius: 6px;">
              <div style="font-size: 18px; font-weight: bold; color: #059669;">${stats.yesCount}</div>
              <div style="font-size: 11px; color: #6b7280;">Sim</div>
            </div>
            <div style="text-align: center; padding: 15px; background: white; border-radius: 6px;">
              <div style="font-size: 18px; font-weight: bold; color: #dc2626;">${stats.noCount}</div>
              <div style="font-size: 11px; color: #6b7280;">Não</div>
            </div>
            <div style="text-align: center; padding: 15px; background: white; border-radius: 6px;">
              <div style="font-size: 18px; font-weight: bold; color: #FF8C00;">${stats.yesPercentage}%</div>
              <div style="font-size: 11px; color: #6b7280;">Conformidade</div>
            </div>
          </div>
        </div>
        
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          Relatório enviado automaticamente para: ${userData.email}
        </p>
      </div>
    `,
    attachments: [
      {
        filename: fileName,
        content: Buffer.from(pdfBuffer),
        contentType: 'application/pdf'
      }
    ]
  });
}

// Save to database
async function saveToDatabase(userData: { email: string; name: string; company?: string }, answers: Answer[]) {
  const stats = getSummaryStats(answers);
  
  console.log('Saving to database...');
  
  const { data, error } = await supabase
    .from('quiz_responses')
    .insert({
      user_email: userData.email,
      user_name: userData.name,
      company_name: userData.company || null,
      answers: answers,
      total_answered: stats.totalAnswered,
      yes_count: stats.yesCount,
      no_count: stats.noCount,
      compliance_percentage: stats.yesPercentage
    })
    .select()
    .single();

  if (error) {
    console.error('Database error:', error);
    throw error;
  }

  console.log('Successfully saved to database with ID:', data.id);
  return data;
}

// Main handler
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, company, answers }: RequestBody = await req.json();
    
    console.log('Starting diagnostic report generation...');
    console.log('User:', { email, name, company });
    console.log('Answers count:', answers.length);

    // Validate input
    if (!email || !name || !answers || !Array.isArray(answers)) {
      return new Response(JSON.stringify({
        ok: false,
        stage: 'validation',
        error: 'Missing required fields: email, name, and answers'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Generate PDF
    console.log('Generating PDF...');
    const pdfBuffer = await generatePDF(answers, { email, name, company });
    console.log('PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    // Save to database
    await saveToDatabase({ email, name, company }, answers);

    // Send emails
    console.log('Sending emails...');
    await sendEmails(pdfBuffer, { email, name, company }, answers);
    console.log('Emails sent successfully');

    return new Response(JSON.stringify({
      ok: true,
      message: 'Diagnóstico processado com sucesso! Verifique seu email.',
      stage: 'completed'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('Error in diagnostic report generation:', error);
    
    return new Response(JSON.stringify({
      ok: false,
      stage: 'processing',
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);