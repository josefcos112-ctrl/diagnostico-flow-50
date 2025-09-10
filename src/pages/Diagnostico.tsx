'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { QuizCard } from '@/components/QuizCard';
import { QuizSummary } from '@/components/QuizSummary';
import { useQuizStore } from '@/store/quiz';

export default function Diagnostico() {
  const { isCompleted, resetQuiz } = useQuizStore();

  const handleRestart = () => {
    resetQuiz();
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <QuizCard />
            </motion.div>
          ) : (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <QuizSummary onRestart={handleRestart} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}