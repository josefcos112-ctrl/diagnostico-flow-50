export type Section = 
  | 'Estrutura Organizacional'
  | 'Processos Financeiros' 
  | 'Planejamento e Orçamento'
  | 'Custos e Precificação'
  | 'Indicadores e Relatórios'
  | 'Sistemas e Tecnologia'
  | 'Contabilidade e Fiscal'
  | 'Pessoas e Cultura';

export interface Question {
  id: number;
  section: Section;
  text: string;
  type: 'boolean';
  dependsOn?: {
    id: number;
    value: 'Sim' | 'Não';
  };
}

export interface Answer {
  id: number;
  value: 'Sim' | 'Não';
}

export const questions: Question[] = [
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

// Section icons mapping
export const sectionIcons: Record<Section, string> = {
  'Estrutura Organizacional': 'Building2',
  'Processos Financeiros': 'DollarSign',
  'Planejamento e Orçamento': 'Target',
  'Custos e Precificação': 'Calculator',
  'Indicadores e Relatórios': 'BarChart3',
  'Sistemas e Tecnologia': 'Cpu',
  'Contabilidade e Fiscal': 'FileText',
  'Pessoas e Cultura': 'Users'
};

// Get filtered questions based on dependencies
export function getFilteredQuestions(answers: Answer[]): Question[] {
  return questions.filter(question => {
    if (!question.dependsOn) return true;
    
    const dependencyAnswer = answers.find(answer => answer.id === question.dependsOn!.id);
    return dependencyAnswer?.value === question.dependsOn.value;
  });
}

// Calculate progress percentage
export function calculateProgress(currentIndex: number, totalQuestions: number): number {
  return Math.round((currentIndex / totalQuestions) * 100);
}

// Get summary statistics
export function getSummaryStats(answers: Answer[]): {
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

// Get summary statistics by section
export function getSectionStats(answers: Answer[]): Record<Section, {
  yesCount: number;
  totalCount: number;
  percentage: number;
}> {
  const sectionStats: Record<Section, { yesCount: number; totalCount: number; percentage: number }> = {
    'Estrutura Organizacional': { yesCount: 0, totalCount: 0, percentage: 0 },
    'Processos Financeiros': { yesCount: 0, totalCount: 0, percentage: 0 },
    'Planejamento e Orçamento': { yesCount: 0, totalCount: 0, percentage: 0 },
    'Custos e Precificação': { yesCount: 0, totalCount: 0, percentage: 0 },
    'Indicadores e Relatórios': { yesCount: 0, totalCount: 0, percentage: 0 },
    'Sistemas e Tecnologia': { yesCount: 0, totalCount: 0, percentage: 0 },
    'Contabilidade e Fiscal': { yesCount: 0, totalCount: 0, percentage: 0 },
    'Pessoas e Cultura': { yesCount: 0, totalCount: 0, percentage: 0 }
  };

  // Count questions per section
  questions.forEach(question => {
    sectionStats[question.section].totalCount++;
  });

  // Count "Sim" answers per section
  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.id);
    if (question && answer.value === 'Sim') {
      sectionStats[question.section].yesCount++;
    }
  });

  // Calculate percentages
  Object.keys(sectionStats).forEach(sectionKey => {
    const section = sectionKey as Section;
    const stats = sectionStats[section];
    stats.percentage = stats.totalCount > 0 ? Math.round((stats.yesCount / stats.totalCount) * 100) : 0;
  });

  return sectionStats;
}