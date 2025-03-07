import { createSlice } from '@reduxjs/toolkit';

const flashcardsSlice = createSlice({
    name: 'flashcards',
    initialState: {
        data: []
    },
    reducers: {
        setFlashcards: (state, action) => {
            state.data = action.payload;
        },
        updateFlashcard: (state, action) => {
            const { index, front, back } = action.payload;
            state.data[index] = { front, back };
        }
    }
});

export const { setFlashcards, updateFlashcard } = flashcardsSlice.actions;

export default flashcardsSlice.reducer;