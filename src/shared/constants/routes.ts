/**
 * @file routes.ts
 * @description Route constants
 * @author Kindy
 * @created 2025-11-16
 */
export const ROUTES = {
  // Auth
  AUTH: {
    LOGIN: 'Login',
    REGISTER: 'Register',
    FORGOT_PASSWORD: 'ForgotPassword',
  },
  // Main
  MAIN: {
    HOME: 'Home',
    SEARCH: 'Search',
    CART: 'Cart',
    PROFILE: 'Profile',
  },
  // Other
  PRODUCT_DETAIL: 'ProductDetail',
  CHECKOUT: 'Checkout',
} as const;

