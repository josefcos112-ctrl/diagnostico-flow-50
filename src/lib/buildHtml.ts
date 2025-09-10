import { Answer, questions, getSummaryStats } from '@/data/questions';

export function buildHtml(answers: Answer[]): string {
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