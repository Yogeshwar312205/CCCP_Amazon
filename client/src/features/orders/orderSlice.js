import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderApi } from '../../services/orderApi';

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async ({ page, limit } = {}, { rejectWithValue }) => {
    try {
      const data = await orderApi.getOrders(page, limit);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const fetchOrderDetail = createAsyncThunk(
  'orders/fetchOrderDetail',
  async (orderId, { rejectWithValue }) => {
    try {
      const data = await orderApi.getOrderById(orderId);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch order details');
    }
  }
);

export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (checkoutData, { rejectWithValue }) => {
    try {
      const data = await orderApi.checkout(checkoutData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || err.response?.data?.message || 'Checkout failed');
    }
  }
);

export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const data = await orderApi.cancelOrder(orderId, reason);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to cancel order');
    }
  }
);

export const fetchReturns = createAsyncThunk(
  'orders/fetchReturns',
  async (_, { rejectWithValue }) => {
    try {
      const data = await orderApi.getReturns();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch returns');
    }
  }
);

export const submitReturn = createAsyncThunk(
  'orders/submitReturn',
  async (returnData, { rejectWithValue }) => {
    try {
      const data = await orderApi.requestReturn(returnData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error?.message || err.response?.data?.message || 'Return request failed');
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  returns: [],
  loading: false,
  checkoutLoading: false,
  error: null,
  checkoutError: null,
  activeCoupon: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    setActiveCoupon: (state, action) => {
      state.activeCoupon = action.payload;
    },
    clearActiveCoupon: (state) => {
      state.activeCoupon = null;
    },
    clearCheckoutError: (state) => {
      state.checkoutError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Order Detail
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.checkoutLoading = true;
        state.checkoutError = null;
      })
      .addCase(placeOrder.fulfilled, (state) => {
        state.checkoutLoading = false;
        state.activeCoupon = null;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.checkoutLoading = false;
        state.checkoutError = action.payload;
      })

      // Cancel Order
      .addCase(cancelOrder.fulfilled, (state, action) => {
        if (state.currentOrder && state.currentOrder.id === action.payload.id) {
          state.currentOrder.status = 'CANCELLED';
        }
        const idx = state.orders.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) {
          state.orders[idx].status = 'CANCELLED';
        }
      })

      // Returns
      .addCase(fetchReturns.fulfilled, (state, action) => {
        state.returns = action.payload;
      })
      .addCase(submitReturn.fulfilled, (state, action) => {
        state.returns.unshift(action.payload);
      });
  },
});

export const { clearCurrentOrder, setActiveCoupon, clearActiveCoupon, clearCheckoutError } =
  orderSlice.actions;

export default orderSlice.reducer;
