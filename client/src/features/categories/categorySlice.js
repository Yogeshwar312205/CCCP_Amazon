import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryApi } from '../../services/categoryApi';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await categoryApi.getCategories(params);
      return data.data.categories;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch categories'
      );
    }
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default categorySlice.reducer;
