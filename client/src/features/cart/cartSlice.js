import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartApi } from '../../services/cartApi';

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const data = await cartApi.getCart();
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch cart'
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (itemData, { rejectWithValue }) => {
    try {
      const data = await cartApi.addItem(itemData);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add item to cart'
      );
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const data = await cartApi.updateQuantity(itemId, quantity);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update quantity'
      );
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (itemId, { rejectWithValue }) => {
    try {
      const data = await cartApi.removeItem(itemId);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove item'
      );
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const data = await cartApi.clearCart();
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to clear cart'
      );
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalItems: 0,
    subtotal: 0,
    loading: false,
    error: null,
  },
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const handleCartFulfilled = (state, action) => {
      state.loading = false;
      state.items = action.payload.items;
      state.totalItems = action.payload.totalItems;
      state.subtotal = action.payload.subtotal;
    };

    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, handleCartFulfilled)
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Item
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, handleCartFulfilled)
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Quantity
      .addCase(updateCartQuantity.fulfilled, handleCartFulfilled)
      .addCase(updateCartQuantity.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Remove Item
      .addCase(removeFromCart.fulfilled, handleCartFulfilled)
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Clear Cart
      .addCase(clearCart.fulfilled, handleCartFulfilled);
  },
});

export const { clearCartError } = cartSlice.actions;
export default cartSlice.reducer;
