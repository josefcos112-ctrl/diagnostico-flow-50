import { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  FileDown,
  Loader2,
  AlertCircle,
  RotateCcw,
  TrendingUp
} from 'lucide-react';
import { useQuizStore } from '@/store/quiz';
import { questions, getSummaryStats, getSectionStats } from '@/data/questions';
import { useToast } from '@/hooks/use-toast';
import { generateDiagnosticPDF } from '@/lib/api';
import { cn } from '@/lib/utils';

interface QuizSummaryProps {
  onRestart?: () => void;
}

export function QuizSummary({ onRestart }: QuizSummaryProps) {
  const { answers, resetQuiz, userData } = useQuizStore();
  const { toast } = useToast();
  
  const [isGenerating, setIsGenerating] = useState(false);

  const stats = getSummaryStats(answers);
  const sectionStats = getSectionStats(answers);

  const handleGeneratePDF = async () => {
    if (!userData) {
      toast({
        title: 'Erro',
        description: 'Dados do usuário não encontrados. Reinicie o diagnóstico.',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generateDiagnosticPDF({
        email: userData.email,
        name: userData.name,
        company: userData.company,
        answers
      });

      if (result.ok) {
        toast({
          title: 'Diagnóstico enviado com sucesso!',
          description: result.message || 'Relatório enviado para análise da nossa equipe',
        });
      } else {
        throw new Error(result.error || 'Erro ao enviar diagnóstico');
      }
    } catch (error) {
      console.error('Error sending diagnostic:', error);
      toast({
        title: 'Erro ao enviar diagnóstico',
        description: error instanceof Error ? error.message : 'Tente novamente em alguns instantes.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRestart = () => {
    resetQuiz();
    onRestart?.();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Summary Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-brand rounded-2xl shadow-brand">
          <BarChart3 className="w-8 h-8 text-white" />
        </div>
        
        <div className="space-y-2">
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Resultado do Diagnóstico
          </h1>
          <p className="text-neutral-600 text-lg">
            Análise da maturidade da gestão financeira da sua empresa
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="text-2xl font-bold">{stats.totalAnswered}</div>
              <div className="text-sm text-neutral-500">Perguntas Respondidas</div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-success">{stats.yesCount}</div>
              <div className="text-sm text-neutral-500">Respostas "Sim"</div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-neutral-600">{stats.noCount}</div>
              <div className="text-sm text-neutral-500">Respostas "Não"</div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-brand-orange">{stats.yesPercentage}%</div>
              <div className="text-sm text-neutral-500">Taxa de Conformidade</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Section Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-brand-orange" />
            <span>Resumo por Seção</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(sectionStats).map(([section, data]) => (
              <div key={section} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                <div className="flex-1">
                  <div className="text-sm font-medium text-neutral-700">{section}</div>
                  <div className="text-xs text-neutral-500">
                    {data.yesCount} de {data.totalCount} itens
                  </div>
                </div>
                <div className="text-lg font-bold text-brand-orange">
                  {data.percentage}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={handleGeneratePDF} 
          disabled={isGenerating}
          className="flex items-center space-x-2 bg-gradient-brand hover:shadow-brand px-8 py-6 text-lg"
          size="lg"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <FileDown className="w-5 h-5" />
          )}
          <span>
            {isGenerating ? 'Enviando...' : 'Concluir e Enviar'}
          </span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={handleRestart}
          className="flex items-center space-x-2 px-8 py-6 text-lg"
          size="lg"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Revisar Respostas</span>
        </Button>
      </div>

      {/* Answers Table */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Respostas Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Seção</TableHead>
                  <TableHead>Pergunta</TableHead>
                  <TableHead className="w-24 text-center">Resposta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question) => {
                  const answer = answers.find(a => a.id === question.id);
                  
                  return (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">{question.id}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {question.section}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{question.text}</TableCell>
                      <TableCell className="text-center">
                        {answer ? (
                          <div className="flex items-center justify-center">
                            {answer.value === 'Sim' ? (
                              <CheckCircle2 className="w-5 h-5 text-success" />
                            ) : (
                              <XCircle className="w-5 h-5 text-neutral-500" />
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-neutral-300" />
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}