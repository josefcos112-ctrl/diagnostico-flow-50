import { Answer } from '@/data/questions';

interface DiagnosticRequest {
  email: string;
  name: string;
  company?: string;
  answers: Answer[];
}

interface DiagnosticResponse {
  ok: boolean;
  stage?: string;
  error?: string;
  details?: any;
  emailId?: string;
  message?: string;
}

const PIPEDREAM_WEBHOOK_URL = 'https://eo3dc3vl6ts0oiz.m.pipedream.net';

export async function sendDiagnosticEmail(request: DiagnosticRequest): Promise<DiagnosticResponse> {
  try {
    console.log('Sending diagnostic data to Pipedream webhook...');
    
    // Calculate statistics
    const stats = {
      totalAnswered: request.answers.length,
      yesCount: request.answers.filter(a => a.value === 'Sim').length,
      noCount: request.answers.filter(a => a.value === 'Não').length,
      yesPercentage: 0
    };
    stats.yesPercentage = stats.totalAnswered > 0 ? Math.round((stats.yesCount / stats.totalAnswered) * 100) : 0;

    const webhookData = {
      userData: {
        email: request.email,
        name: request.name,
        company: request.company
      },
      answers: request.answers,
      stats: stats,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(PIPEDREAM_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with status: ${response.status}`);
    }

    console.log('Webhook triggered successfully');
    return {
      ok: true,
      message: 'Diagnóstico enviado com sucesso!'
    };

  } catch (error: any) {
    console.error('Webhook error:', error);
    return {
      ok: false,
      stage: 'webhook',
      error: error.message || 'Failed to trigger Pipedream webhook'
    };
  }
}

// Keep the old function name for compatibility
export const generateDiagnosticPDF = sendDiagnosticEmail;