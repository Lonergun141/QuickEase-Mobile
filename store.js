import { configureStore } from '@reduxjs/toolkit';
import pomodoroSlice from './components/Pomodoro/pomodoroSlice';
import quizReducer from './features/quizSlice';
import flashcardsReducer from './features/flashcard';
import authSlice from './features/auth/authSlice';
import uploadSlice from './Reducers/FileHandling/uploadSlice';
import noteSlice from './components/Notes/noteSlice';

export default configureStore({
	reducer: {
		pomodoro: pomodoroSlice,
		quiz: quizReducer,
		flashcards: flashcardsReducer,
		auth: authSlice,
		upload: uploadSlice,
		notes: noteSlice,
	},
});
