/** Client-side helpers (no external API server required). */
export const setUnauthorizedHandler = () => {};

/** Extract a human-friendly message + field errors. */
export const parseError = (error, fallback = 'Something went wrong. Please try again.') => {
  const data = error?.response?.data;
  if (data) {
    return { message: data.message || fallback, fields: data.errors || {}, status: error.response.status };
  }
  return { message: error?.message || fallback, fields: {} };
};

/** Resolve stored image paths (/images/x.jpg, data:image/..., https://…). */
export const assetUrl = (path) => path || '';
