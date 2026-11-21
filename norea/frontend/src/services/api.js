import axios from 'axios';

/**
 * Single axios instance. Auth uses an httpOnly cookie set by the API,
 * so no token is ever stored in localStorage or exposed to JS.
 */
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
  withCredentials: true,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    if (status === 401 && onUnauthorized && !url.includes('/auth/login') && !url.includes('/auth/me')) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

/** Extract a human-friendly message + field errors from an axios error. */
export const parseError = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error?.response) {
    return { message: 'Unable to reach the server. Please check your connection.', fields: {} };
  }
  const { data } = error.response;
  return { message: data?.message || fallback, fields: data?.errors || {}, status: error.response.status };
};

/** Resolve stored image paths (/uploads/x.jpg, /images/x.jpg, https://…) to a usable URL. */
export const assetUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith('/uploads/')) return `${import.meta.env.VITE_API_URL || ''}${path}`;
  return path;
};

export default api;
