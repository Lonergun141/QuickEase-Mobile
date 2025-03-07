import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	currentSummaryId: null,
};

const notesSlice = createSlice({
	name: 'notes',
	initialState,
	reducers: {
		setCurrentSummaryId(state, action) {
			state.currentSummaryId = action.payload;
		},
	},
});

export const { setCurrentSummaryId } = notesSlice.actions;
export default notesSlice.reducer;
