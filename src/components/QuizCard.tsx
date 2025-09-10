'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  DollarSign, 
  Target, 
  Calculator, 
  BarChart3, 
  Cpu, 
  FileText, 
  Users,
  CheckCircle2
} from 'lucide-react';
import { useQuizStore } from '@/store/quiz';
import { sectionIcons } from '@/data/questions';
import { cn } from '@/lib/utils';
import { UserDataForm } from './UserDataForm';

const iconMap = {
  Building2,
  DollarSign,
  Target,
  Calculator,
  BarChart3,
  Cpu,
  FileText,
  Users
};

interface QuizCardProps {
  onComplete?: () => void;
}

export function QuizCard({ onComplete }: QuizCardProps) {
  const {
    getCurrentQuestion,
    getFilteredQuestions,
    getProgress,
    getAnswerForQuestion,
    setAnswer,
    nextQuestion,
    previousQuestion,
    canGoNext,
    canGoPrevious,
    currentIndex,
    completeQuiz,
    userData,
    hasStarted,
    setUserData,
    startQuiz
  } = useQuizStore();

  const handleUserDataSubmit = (userData: { email: string; name: string; company: string }) => {
    setUserData(userData);
    startQuiz();
  };

  // Show user data form if not started yet
  if (!hasStarted || !userData) {
    return <UserDataForm onSubmit={handleUserDataSubmit} />;
  }

  const currentQuestion = getCurrentQuestion();
  const filteredQuestions = getFilteredQuestions();
  const progress = getProgress();
  const currentAnswer = currentQuestion ? getAnswerForQuestion(currentQuestion.id) : undefined;

  if (!currentQuestion) {
    return null;
  }

  const handleAnswer = (value: 'Sim' | 'Não') => {
    setAnswer(currentQuestion.id, value);
  };

  const handleNext = () => {
    if (canGoNext()) {
      nextQuestion();
    } else {
      completeQuiz();
      onComplete?.();
    }
  };

  const IconComponent = iconMap[sectionIcons[currentQuestion.section] as keyof typeof iconMap];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Progress Header */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-orange rounded-full">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-800">
            Diagnóstico Empresarial
          </h1>
          <p className="text-xl text-neutral-600 font-medium">
            Controladoria Gerencial
          </p>
          <p className="text-neutral-500">
            Responda com honestidade para obter insights precisos
          </p>
        </div>

        <div className="w-full space-y-3">
          <div className="flex justify-between text-sm text-neutral-500">
            <span>Pergunta {currentIndex + 1} de {filteredQuestions.length}</span>
            <span>{progress}% concluído</span>
          </div>
          <Progress value={progress} className="h-2 bg-neutral-200" />
        </div>
      </div>

      {/* Question Card */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative"
      >
        {/* Info icon in top right */}
        <div className="absolute -top-2 -right-2 z-10">
          <div className="w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">i</span>
          </div>
        </div>

        <Card className="bg-white shadow-lg border border-neutral-100 rounded-3xl overflow-hidden">
          <CardHeader className="text-center space-y-6 py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-orange rounded-full">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            
            <div className="space-y-3">
              <p className="text-brand-orange text-sm font-medium uppercase tracking-wider">
                {currentQuestion.section}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 leading-tight px-4">
                {currentQuestion.text}
              </h2>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                className={cn(
                  "flex-1 h-14 text-lg font-semibold rounded-full transition-all duration-200",
                  currentAnswer?.value === 'Sim' 
                    ? "bg-brand-orange hover:bg-brand-orange/90 text-white border-0 shadow-lg" 
                    : "bg-neutral-100 hover:bg-brand-orange/10 text-neutral-600 border border-neutral-200 hover:border-brand-orange/30"
                )}
                onClick={() => handleAnswer('Sim')}
              >
                Sim
              </Button>
              
              <Button
                size="lg"
                className={cn(
                  "flex-1 h-14 text-lg font-semibold rounded-full transition-all duration-200",
                  currentAnswer?.value === 'Não' 
                    ? "bg-neutral-600 hover:bg-neutral-700 text-white border-0 shadow-lg" 
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600 border border-neutral-200"
                )}
                onClick={() => handleAnswer('Não')}
              >
                Não
              </Button>
            </div>
          </CardContent>

          {/* Navigation */}
          {currentAnswer && (
            <CardFooter className="flex justify-between px-8 pb-6">
              <Button
                variant="ghost"
                onClick={previousQuestion}
                disabled={!canGoPrevious()}
                className="text-neutral-500 hover:text-neutral-700"
              >
                ← Voltar
              </Button>
              
              <Button
                onClick={handleNext}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white"
              >
                {canGoNext() ? 'Próxima →' : 'Finalizar'}
              </Button>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  );
}