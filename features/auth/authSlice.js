import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from './authServices';

const initialState = {
	user: null,
	userInfo: null,
	isError: false,
	isSuccess: false,
	isLoading: false,
	message: '',
	errors: {},
	loginAttempts: 0,
	canRetryLogin: true,
	retryTimerEnd: null,
	initialStateLoaded: false,
};

export const register = createAsyncThunk('auth/register', async (user, thunkAPI) => {
	try {
		return await authService.register(user);
	} catch (error) {
		return thunkAPI.rejectWithValue(authService.handleError(error));
	}
});

export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
	try {
		return await authService.login(userData);
	} catch (error) {
		return thunkAPI.rejectWithValue(authService.handleError(error));
	}
});

export const refresh = createAsyncThunk('auth/refresh', async (_, thunkAPI) => {
	try {
		const newTokens = await authService.refresh();
		await AsyncStorage.setItem('user', JSON.stringify(newTokens));
		return newTokens;
	} catch (error) {
		await AsyncStorage.removeItem('user');
		return thunkAPI.rejectWithValue(authService.handleError(error));
	}
});

export const logout = createAsyncThunk('auth/logout', async () => {
	await authService.logout();
});

export const activate = createAsyncThunk('auth/activate', async (userData, thunkAPI) => {
	try {
		return await authService.activate(userData);
	} catch (error) {
		return thunkAPI.rejectWithValue(authService.handleError(error));
	}
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (userData, thunkAPI) => {
	try {
		return await authService.resetPassword(userData);
	} catch (error) {
		return thunkAPI.rejectWithValue(authService.handleError(error));
	}
});

export const resetPasswordConfirm = createAsyncThunk(
	'auth/resetPasswordConfirm',
	async (userData, thunkAPI) => {
		try {
			return await authService.resetPasswordConfirm(userData);
		} catch (error) {
			return thunkAPI.rejectWithValue(authService.handleError(error));
		}
	}
);

export const fetchUserInfo = createAsyncThunk('auth/getUserInfo', async (_, thunkAPI) => {
	try {
		const user = JSON.parse(await AsyncStorage.getItem('user'));
		if (!user || !user.access) {
			throw new Error('No valid user data found');
		}
		return await authService.getUserInfo(user.access);
	} catch (error) {
		console.log(authService.handleError(error));
	}
});

export const deleteUser = createAsyncThunk('auth/deleteUser', async (currentPassword, thunkAPI) => {
	try {
		await authService.deleteUser(currentPassword);
		return 'User deleted successfully';
	} catch (error) {
		return thunkAPI.rejectWithValue(authService.handleError(error));
	}
});

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		reset: (state) => {
			state.isLoading = false;
			state.isError = false;
			state.isSuccess = false;
			state.message = '';
			state.errors = {};
		},
		resetLoginAttempts: (state) => {
			state.loginAttempts = 0;
			state.canRetryLogin = true;
			state.retryTimerEnd = null;
		},
		setUser: (state, action) => {
			state.user = action.payload;
		},
		setInitialStateLoaded: (state) => {
			state.initialStateLoaded = true;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(register.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(register.fulfilled, (state, action) => {
				state.isLoading = false;
				state.isSuccess = true;
			})
			.addCase(register.rejected, (state, action) => {
				state.isLoading = false;
				state.isError = true;
				state.message = action.payload.message;
				state.errors = action.payload.errors;
			})
			.addCase(login.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(login.fulfilled, (state, action) => {
				state.isLoading = false;
				state.isSuccess = true;
				state.user = action.payload;
				state.userInfo = action.payload;
				state.loginAttempts = 0;
				state.canRetryLogin = true;
				if (state.retryTimer) clearTimeout(state.retryTimer);
				state.retryTimer = null;
			})
			.addCase(login.rejected, (state, action) => {
				state.isLoading = false;
				state.isError = true;
				state.message = action.payload.message;
				state.errors = action.payload.errors;
				state.user = null;
				state.loginAttempts += 1;
				if (state.loginAttempts >= 4) {
					state.canRetryLogin = false;
					state.retryTimerEnd = Date.now() + 60000;
				}
			})
			.addCase(refresh.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(refresh.fulfilled, (state, action) => {
				state.isLoading = false;
				state.isSuccess = true;
				state.user = action.payload;
				state.userInfo = action.payload;
			})
			.addCase(refresh.rejected, (state, action) => {
				state.isLoading = false;
				state.isError = true;
				state.message = action.payload.message;
				state.errors = action.payload.errors;
				state.user = null;
			})
			.addCase(logout.fulfilled, (state) => {
				state.user = null;
				state.userInfo = null;
				state.isError = false;
				state.isSuccess = false;
				state.isLoading = false;
				state.message = '';
				state.errors = {};
				state.initialStateLoaded = true;
			})
			.addCase(activate.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(activate.fulfilled, (state, action) => {
				state.isLoading = false;
				state.isSuccess = true;
				state.message = 'Account activated successfully.';
			})
			.addCase(activate.rejected, (state, action) => {
				state.isLoading = false;
				state.isError = true;
				state.message = action.payload.message;
				state.errors = action.payload.errors;
			})
			.addCase(resetPassword.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(resetPassword.fulfilled, (state) => {
				state.isLoading = false;
				state.isSuccess = true;
				state.message = 'Password reset email sent successfully.';
			})
			.addCase(resetPassword.rejected, (state, action) => {
				state.isLoading = false;
				state.isError = true;
				state.message = action.payload.message;
				state.errors = action.payload.errors || {};
			})
			.addCase(resetPasswordConfirm.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(resetPasswordConfirm.fulfilled, (state, action) => {
				state.isLoading = false;
				state.isSuccess = true;
				state.message = 'Password reset successful.';
			})
			.addCase(resetPasswordConfirm.rejected, (state, action) => {
				state.isLoading = false;
				state.isError = true;
				state.message = action.payload.message;
				state.errors = action.payload.errors;
			})
			.addCase(fetchUserInfo.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(fetchUserInfo.fulfilled, (state, action) => {
				state.isLoading = false;
				state.isSuccess = true;
				state.userInfo = action.payload;
				state.initialStateLoaded = true;
			})
			.addCase(fetchUserInfo.rejected, (state, action) => {
				state.isLoading = false;
				state.isError = true;
				state.message = action.payload.message;
				state.initialStateLoaded = true;
				state.errors = action.payload.errors;
			})
			.addCase(deleteUser.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(deleteUser.fulfilled, (state, action) => {
				state.isLoading = false;
				state.isSuccess = true;
				state.user = null;
				state.message = 'User account deleted successfully.';
			})
			.addCase(deleteUser.rejected, (state, action) => {
				state.isLoading = false;
				state.isError = true;
				state.message = action.payload.message;
				state.errors = action.payload.errors;
			});
	},
});

export const { reset, resetLoginAttempts, setUser, setInitialStateLoaded } = authSlice.actions;
export default authSlice.reducer;
