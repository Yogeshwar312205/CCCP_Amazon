/**
 * App-wide constants.
 * Import: import { ORDER_STATUS, ROLES } from '../utils/constants';
 */

export const ROLES = {
  CUSTOMER:    'CUSTOMER',
  ADMIN:       'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
};

export const ORDER_STATUS = {
  PENDING:    'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED:    'SHIPPED',
  DELIVERED:  'DELIVERED',
  CANCELLED:  'CANCELLED',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]:    'Pending',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.SHIPPED]:    'Shipped',
  [ORDER_STATUS.DELIVERED]:  'Delivered',
  [ORDER_STATUS.CANCELLED]:  'Cancelled',
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]:    'text-yellow-600 bg-yellow-50',
  [ORDER_STATUS.PROCESSING]: 'text-blue-600 bg-blue-50',
  [ORDER_STATUS.SHIPPED]:    'text-purple-600 bg-purple-50',
  [ORDER_STATUS.DELIVERED]:  'text-green-600 bg-green-50',
  [ORDER_STATUS.CANCELLED]:  'text-red-600 bg-red-50',
};

export const RETURN_STATUS = {
  REQUESTED: 'REQUESTED',
  APPROVED:  'APPROVED',
  REJECTED:  'REJECTED',
  REFUNDED:  'REFUNDED',
};

export const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest Arrivals' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Highest Rated' },
  { value: 'popularity', label: 'Most Popular' },
];

export const PAGE_SIZE_OPTIONS = [12, 24, 48];

export const DEFAULT_PRODUCT_IMAGE = 'https://placehold.co/400x400?text=No+Image';
