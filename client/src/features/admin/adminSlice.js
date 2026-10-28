import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/adminApi';

// Analytics Thunks
export const fetchOverviewStats = createAsyncThunk(
  'admin/fetchOverviewStats',
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminApi.getOverview();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

export const fetchSalesChart = createAsyncThunk(
  'admin/fetchSalesChart',
  async (days = 14, { rejectWithValue }) => {
    try {
      const data = await adminApi.getSalesChart(days);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch sales chart');
    }
  }
);

export const fetchTopProducts = createAsyncThunk(
  'admin/fetchTopProducts',
  async (limit = 5, { rejectWithValue }) => {
    try {
      const data = await adminApi.getTopProducts(limit);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch top products');
    }
  }
);

// Products Thunk
export const fetchAdminProducts = createAsyncThunk(
  'admin/fetchAdminProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await adminApi.getProducts(params);
      return { products: data.data, pagination: data.pagination };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch products');
    }
  }
);

// Inventory Thunk
export const fetchAdminInventory = createAsyncThunk(
  'admin/fetchAdminInventory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await adminApi.getInventory(params);
      return { inventory: data.data, pagination: data.pagination };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch inventory');
    }
  }
);

// Orders Thunk
export const fetchAdminOrders = createAsyncThunk(
  'admin/fetchAdminOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await adminApi.getOrders(params);
      return { orders: data.data, pagination: data.pagination };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

// Returns Thunk
export const fetchAdminReturns = createAsyncThunk(
  'admin/fetchAdminReturns',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await adminApi.getReturns(params);
      return { returns: data.data, pagination: data.pagination };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch returns');
    }
  }
);

// Coupons Thunk
export const fetchAdminCoupons = createAsyncThunk(
  'admin/fetchAdminCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminApi.getCoupons();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch coupons');
    }
  }
);

// Admin Management Thunk (SUPER_ADMIN)
export const fetchAdminAccounts = createAsyncThunk(
  'admin/fetchAdminAccounts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await adminApi.getAdmins(params);
      return { admins: data.data, pagination: data.pagination };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch admin accounts');
    }
  }
);

// Audit Logs Thunk (SUPER_ADMIN)
export const fetchAuditLogs = createAsyncThunk(
  'admin/fetchAuditLogs',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await adminApi.getAuditLogs(params);
      return { logs: data.data, pagination: data.pagination };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch audit logs');
    }
  }
);

const initialState = {
  // Overview
  overview: null,
  salesChart: [],
  topProducts: [],
  analyticsLoading: false,

  // Products
  products: [],
  productsPagination: null,
  productsLoading: false,

  // Inventory
  inventory: [],
  inventoryPagination: null,
  inventoryLoading: false,

  // Orders
  orders: [],
  ordersPagination: null,
  ordersLoading: false,

  // Returns
  returns: [],
  returnsPagination: null,
  returnsLoading: false,

  // Coupons
  coupons: [],
  couponsLoading: false,

  // Admin Accounts (SUPER_ADMIN)
  adminAccounts: [],
  adminAccountsPagination: null,
  adminAccountsLoading: false,

  // Audit Logs (SUPER_ADMIN)
  auditLogs: [],
  auditPagination: null,
  auditLoading: false,

  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Overview
      .addCase(fetchOverviewStats.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(fetchOverviewStats.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.overview = action.payload;
      })
      .addCase(fetchOverviewStats.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload;
      })

      // Sales Chart
      .addCase(fetchSalesChart.fulfilled, (state, action) => {
        state.salesChart = action.payload;
      })

      // Top Products
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.topProducts = action.payload;
      })

      // Products
      .addCase(fetchAdminProducts.pending, (state) => {
        state.productsLoading = true;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.products = action.payload.products;
        state.productsPagination = action.payload.pagination;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.error = action.payload;
      })

      // Inventory
      .addCase(fetchAdminInventory.pending, (state) => {
        state.inventoryLoading = true;
      })
      .addCase(fetchAdminInventory.fulfilled, (state, action) => {
        state.inventoryLoading = false;
        state.inventory = action.payload.inventory;
        state.inventoryPagination = action.payload.pagination;
      })
      .addCase(fetchAdminInventory.rejected, (state, action) => {
        state.inventoryLoading = false;
        state.error = action.payload;
      })

      // Orders
      .addCase(fetchAdminOrders.pending, (state) => {
        state.ordersLoading = true;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload.orders;
        state.ordersPagination = action.payload.pagination;
      })
      .addCase(fetchAdminOrders.rejected, (state, action) => {
        state.ordersLoading = false;
        state.error = action.payload;
      })

      // Returns
      .addCase(fetchAdminReturns.pending, (state) => {
        state.returnsLoading = true;
      })
      .addCase(fetchAdminReturns.fulfilled, (state, action) => {
        state.returnsLoading = false;
        state.returns = action.payload.returns;
        state.returnsPagination = action.payload.pagination;
      })
      .addCase(fetchAdminReturns.rejected, (state, action) => {
        state.returnsLoading = false;
        state.error = action.payload;
      })

      // Coupons
      .addCase(fetchAdminCoupons.pending, (state) => {
        state.couponsLoading = true;
      })
      .addCase(fetchAdminCoupons.fulfilled, (state, action) => {
        state.couponsLoading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchAdminCoupons.rejected, (state, action) => {
        state.couponsLoading = false;
        state.error = action.payload;
      })

      // Admin Accounts (SUPER_ADMIN)
      .addCase(fetchAdminAccounts.pending, (state) => {
        state.adminAccountsLoading = true;
      })
      .addCase(fetchAdminAccounts.fulfilled, (state, action) => {
        state.adminAccountsLoading = false;
        state.adminAccounts = action.payload.admins;
        state.adminAccountsPagination = action.payload.pagination;
      })
      .addCase(fetchAdminAccounts.rejected, (state, action) => {
        state.adminAccountsLoading = false;
        state.error = action.payload;
      })

      // Audit Logs (SUPER_ADMIN)
      .addCase(fetchAuditLogs.pending, (state) => {
        state.auditLoading = true;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLoading = false;
        state.auditLogs = action.payload.logs;
        state.auditPagination = action.payload.pagination;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.auditLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
