import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Answer, questions, getFilteredQuestions } from '@/data/questions';

export interface UserData {
  email: string;
  name: string;
  company: string;
}

interface QuizState {
  currentIndex: number;
  answers: Answer[];
  isCompleted: boolean;
  userData: UserData | null;
  hasStarted: boolean;
  
  // Actions
  setCurrentIndex: (index: number) => void;
  setAnswer: (questionId: number, value: 'Sim' | 'Não') => void;
  removeAnswer: (questionId: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  setUserData: (userData: UserData) => void;
  startQuiz: () => void;
  
  // Getters
  getCurrentQuestion: () => typeof questions[0] | null;
  getFilteredQuestions: () => typeof questions;
  getProgress: () => number;
  canGoNext: () => boolean;
  canGoPrevious: () => boolean;
  getAnswerForQuestion: (questionId: number) => Answer | undefined;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      currentIndex: 0,
      answers: [],
      isCompleted: false,
      userData: null,
      hasStarted: false,

      setCurrentIndex: (index: number) => {
        set({ currentIndex: index });
      },

      setAnswer: (questionId: number, value: 'Sim' | 'Não') => {
        const state = get();
        const existingAnswerIndex = state.answers.findIndex(a => a.id === questionId);
        
        if (existingAnswerIndex >= 0) {
          // Update existing answer
          const newAnswers = [...state.answers];
          newAnswers[existingAnswerIndex] = { id: questionId, value };
          set({ answers: newAnswers });
        } else {
          // Add new answer
          set({ answers: [...state.answers, { id: questionId, value }] });
        }
      },

      removeAnswer: (questionId: number) => {
        const state = get();
        const filteredAnswers = state.answers.filter(a => a.id !== questionId);
        set({ answers: filteredAnswers });
      },

      nextQuestion: () => {
        const state = get();
        const filteredQuestions = getFilteredQuestions(state.answers);
        
        if (state.currentIndex < filteredQuestions.length - 1) {
          set({ currentIndex: state.currentIndex + 1 });
        } else {
          // Quiz completed
          set({ isCompleted: true });
        }
      },

      previousQuestion: () => {
        const state = get();
        if (state.currentIndex > 0) {
          set({ currentIndex: state.currentIndex - 1 });
        }
      },

      goToQuestion: (index: number) => {
        const state = get();
        const filteredQuestions = getFilteredQuestions(state.answers);
        
        if (index >= 0 && index < filteredQuestions.length) {
          set({ currentIndex: index });
        }
      },

      completeQuiz: () => {
        set({ isCompleted: true });
      },

      resetQuiz: () => {
        set({
          currentIndex: 0,
          answers: [],
          isCompleted: false,
          userData: null,
          hasStarted: false
        });
      },

      setUserData: (userData: UserData) => {
        set({ userData });
      },

      startQuiz: () => {
        set({ hasStarted: true });
      },

      getCurrentQuestion: () => {
        const state = get();
        const filteredQuestions = getFilteredQuestions(state.answers);
        return filteredQuestions[state.currentIndex] || null;
      },

      getFilteredQuestions: () => {
        const state = get();
        return getFilteredQuestions(state.answers);
      },

      getProgress: () => {
        const state = get();
        const filteredQuestions = getFilteredQuestions(state.answers);
        return Math.round(((state.currentIndex + 1) / filteredQuestions.length) * 100);
      },

      canGoNext: () => {
        const state = get();
        const filteredQuestions = getFilteredQuestions(state.answers);
        return state.currentIndex < filteredQuestions.length - 1;
      },

      canGoPrevious: () => {
        const state = get();
        return state.currentIndex > 0;
      },

      getAnswerForQuestion: (questionId: number) => {
        const state = get();
        return state.answers.find(a => a.id === questionId);
      }
    }),
    {
      name: 'business-diagnostic-quiz',
      partialize: (state) => ({
        currentIndex: state.currentIndex,
        answers: state.answers,
        isCompleted: state.isCompleted,
        userData: state.userData,
        hasStarted: state.hasStarted
      })
    }
  )
);