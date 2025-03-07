import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import pomodoroService from '../../features/pomodoro/pomodoroServices';

export const fetchPomodoroSettings = createAsyncThunk(
	'pomodoro/fetchSettings',
	async (_, { rejectWithValue }) => {
		try {
			const settings = await pomodoroService.fetchSettings();
			return settings || null;
		} catch (error) {
			return rejectWithValue(error.response?.data);
		}
	}
);

export const savePomodoroSettings = createAsyncThunk(
	'pomodoro/saveSettings',
	async (settings, { getState, rejectWithValue }) => {
		try {
			const { pomodoro } = getState();
			if (pomodoro.settingsId) {
				return await pomodoroService.updateSettings(pomodoro.settingsId, settings);
			} else {
				return await pomodoroService.createSettings(settings);
			}
		} catch (error) {
			return rejectWithValue(error.response?.data);
		}
	}
);

const initialState = {
	activeSettings: {
		studyTime: 25,
		shortBreak: 5,
		longBreak: 15,
		showTimer: true,
	},
	pendingSettings: {
		studyTime: 25,
		shortBreak: 5,
		longBreak: 15,
		showTimer: true,
	},
	currentTime: 25 * 60,
	isRunning: false,
	session: 'study',
	cycleCount: 0,
	showBreakModal: false,
	isLoading: false,
	error: null,
	settingsId: null,
	isPomodoroVisible: true,
	startTime: null,
	pausedTimeRemaining: null,
	justFinished: false,
	cycleStarted: false,
	isAlarmPlaying: false,
};

const pomodoroSlice = createSlice({
	name: 'pomodoro',
	initialState,
	reducers: {
		setPendingSetting: (state, action) => {
			state.pendingSettings = { ...state.pendingSettings, ...action.payload };
		},
		applySettings: (state) => {
			state.activeSettings = { ...state.pendingSettings };
			state.currentTime = state.activeSettings.studyTime * 60;
			state.isRunning = false;
			state.session = 'study';
		},
		startTimer: (state) => {
			state.isRunning = true;
			state.cycleStarted = true;
			if (state.pausedTimeRemaining !== null) {
				const currentTime = Date.now();
				state.startTime =
					currentTime -
					(state.activeSettings[
						state.session === 'study'
							? 'studyTime'
							: state.session === 'shortBreak'
							? 'shortBreak'
							: 'longBreak'
					] *
						60 -
						state.pausedTimeRemaining) *
						1000;
				state.pausedTimeRemaining = null;
			} else {
				state.startTime = Date.now();
			}
			state.justFinished = false;
		},
		pauseTimer: (state) => {
			state.isRunning = false;
			state.pausedTimeRemaining = state.currentTime; // Store current time when pausing
		},
		decrementTime: (state) => {
			if (state.isRunning) {
				const elapsedTime = Math.floor((Date.now() - state.startTime) / 1000);
				const targetTime =
					(state.session === 'study'
						? state.activeSettings.studyTime
						: state.session === 'shortBreak'
						? state.activeSettings.shortBreak
						: state.activeSettings.longBreak) * 60;

				const timeLeft = targetTime - elapsedTime;

				if (timeLeft <= 0) {
					state.isRunning = false;
					state.currentTime = 0;
					state.justFinished = true;
				} else {
					state.currentTime = timeLeft;
				}
			}
		},

		handleSessionEnd: (state) => {
			state.justFinished = false;
			state.isAlarmPlaying = true;
			if (state.session === 'study') {
				state.cycleCount += 1;
				if (state.cycleCount % 4 === 0) {
					state.currentTime = state.activeSettings.longBreak * 60;
					state.session = 'longBreak';
				} else {
					state.currentTime = state.activeSettings.shortBreak * 60;
					state.session = 'shortBreak';
				}
				state.showBreakModal = true;
				state.isRunning = false;
				state.startTime = null;
			} else {
				state.currentTime = state.activeSettings.studyTime * 60;
				state.session = 'study';
				state.showBreakModal = false;
				state.isRunning = false;
				state.startTime = null;
			}
			state.pausedTimeRemaining = null;
		},

		resetTimer: (state) => {
			state.isRunning = false;
			state.currentTime = state.activeSettings.studyTime * 60;
			state.startTime = null;
			state.pausedTimeRemaining = null;
			state.session = 'study';
			state.cycleCount = 0;
			state.showBreakModal = false;
			state.cycleStarted = false;
			state.isAlarmPlaying = false;
		},
		skipSession: (state) => {
			if (state.session === 'study') {
				state.cycleCount += 1;
				if (state.cycleCount % 3 === 0) {
					state.currentTime = state.activeSettings.longBreak * 60;
					state.session = 'longBreak';
				} else {
					state.currentTime = state.activeSettings.shortBreak * 60;
					state.session = 'shortBreak';
				}
				state.showBreakModal = true;
			} else {
				state.currentTime = state.activeSettings.studyTime * 60;
				state.session = 'study';
				state.showBreakModal = false;
			}
			state.isRunning = false;
		},
		closeBreakModal: (state) => {
			state.showBreakModal = false;
		},
		resetPomodoroState: (state) => {
			return initialState;
		},
		setPomodoroVisibility: (state, action) => {
			state.isPomodoroVisible = action.payload;
		},
		setAlarmPlaying: (state, action) => {
			state.isAlarmPlaying = action.payload;
		},
		stopAlarm: (state) => {
			state.isAlarmPlaying = false;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchPomodoroSettings.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(fetchPomodoroSettings.fulfilled, (state, action) => {
				state.isLoading = false;
				state.error = null;
				if (action.payload) {
					state.activeSettings = {
						studyTime: action.payload.study_time,
						shortBreak: action.payload.short_break,
						longBreak: action.payload.long_break,
						showTimer: action.payload.show_timer,
					};
					state.pendingSettings = { ...state.activeSettings };
					state.settingsId = action.payload.id;
					state.currentTime = state.activeSettings.studyTime * 60;
					state.isPomodoroVisible = action.payload.show_timer;
				}
			})
			.addCase(fetchPomodoroSettings.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
			})
			.addCase(savePomodoroSettings.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(savePomodoroSettings.fulfilled, (state, action) => {
				state.isLoading = false;
				state.error = null;
				state.activeSettings = {
					studyTime: action.payload.study_time,
					shortBreak: action.payload.short_break,
					longBreak: action.payload.long_break,
					showTimer: action.payload.show_timer,
				};
				state.pendingSettings = { ...state.activeSettings };
				state.settingsId = action.payload.id;
				state.currentTime = state.activeSettings.studyTime * 60;
				state.isPomodoroVisible = action.payload.show_timer;
			})
			.addCase(savePomodoroSettings.rejected, (state, action) => {
				state.isLoading = false;
				state.error = action.payload;
			});
	},
});

export const {
	setPendingSetting,
	applySettings,
	startTimer,
	pauseTimer,
	decrementTime,
	resetTimer,
	skipSession,
	closeBreakModal,
	resetPomodoroState,
	setPomodoroVisibility,
	handleSessionEnd,
	setAlarmPlaying,
	stopAlarm,
} = pomodoroSlice.actions;

export default pomodoroSlice.reducer;
