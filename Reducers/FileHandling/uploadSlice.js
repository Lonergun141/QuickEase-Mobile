import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  uploadedImages: [],
  uploadedDocuments: [],
  isUploading: false,
  error: null,
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    addUploadedImages: (state, action) => {
      state.uploadedImages = [...state.uploadedImages, ...action.payload];
    },
    addUploadedDocuments: (state, action) => {
      state.uploadedDocuments = [...state.uploadedDocuments, ...action.payload];
    },
    removeUploadedImage: (state, action) => {
      state.uploadedImages = state.uploadedImages.filter(
        (image) => image.id !== action.payload
      );
    },
    removeUploadedDocument: (state, action) => {
      state.uploadedDocuments = state.uploadedDocuments.filter(
        (doc) => doc.id !== action.payload
      );
    },
    clearUploads: (state) => {
      state.uploadedImages = [];
      state.uploadedDocuments = [];
      state.isUploading = false;
      state.error = null;
    },
    setUploading: (state, action) => {
      state.isUploading = action.payload;
    },
    setUploadError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  addUploadedImages,
  addUploadedDocuments,
  removeUploadedImage,
  removeUploadedDocument,
  clearUploads,
  setUploading,
  setUploadError,
} = uploadSlice.actions;

export default uploadSlice.reducer;
