import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productApi } from '../../services/productApi';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      const data = await productApi.getProducts(params);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch products'
      );
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const data = await productApi.getFeaturedProducts();
      return data.data.products;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch featured products'
      );
    }
  }
);

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchProductBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const data = await productApi.getProductBySlug(slug);
      return data.data.product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch product details'
      );
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    featuredItems: [],
    selectedProduct: null,
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 1,
    },
    availableBrands: [],
    filters: {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
      minRating: '',
      inStockOnly: false,
      sort: 'newest',
      page: 1,
    },
    loading: false,
    detailLoading: false,
    error: null,
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        search: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        brand: '',
        minRating: '',
        inStockOnly: false,
        sort: 'newest',
        page: 1,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.meta.pagination;
        state.availableBrands = action.payload.meta.availableBrands;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Featured Products
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredItems = action.payload;
      })
      // Fetch By Slug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilter, setPage, resetFilters } = productSlice.actions;
export default productSlice.reducer;
