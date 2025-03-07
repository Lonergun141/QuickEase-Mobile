import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentQuiz: {
    id: null,
    title: '',
    score: 0,
    totalQuestions: 0,
    selectedAnswers: {},
    questions: [],
    dateTaken: null,
  },
  quizHistory: [],
};

export const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setCurrentQuiz: (state, action) => {
      state.currentQuiz = {
        ...state.currentQuiz,
        ...action.payload,
        dateTaken: new Date().toISOString(),
      };
    },
    updateQuizResults: (state, action) => {
        const { id, score, totalQuestions, selectedAnswers, questions, title } = action.payload;
        
        console.log("Updating quiz results:", action.payload); // Add this log
        
        const updatedQuiz = {
          id,
          title,
          score,
          totalQuestions,
          selectedAnswers,
          questions,
          dateTaken: new Date().toISOString(),
        };
      
        const existingQuizIndex = state.quizHistory.findIndex(quiz => quiz.id === id);
        
        if (existingQuizIndex !== -1) {
          state.quizHistory[existingQuizIndex] = updatedQuiz;
        } else {
          state.quizHistory.push(updatedQuiz);
        }
      
        state.currentQuiz = updatedQuiz;
      
        console.log("Updated quiz history:", state.quizHistory); // Keep this log
      },
    removeQuiz: (state, action) => {
      state.quizHistory = state.quizHistory.filter(quiz => quiz.id !== action.payload);
    },
  },
});

export const { setCurrentQuiz, updateQuizResults, removeQuiz } = quizSlice.actions;

export default quizSlice.reducer;