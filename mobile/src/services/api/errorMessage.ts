import axios from 'axios';

interface APIErrorResponse {
  detail?: string | Array<{ msg?: string; message?: string }>;
  message?: string;
}

export const getAPIErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<APIErrorResponse>(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    if (typeof data?.detail === 'string') {
      return data.detail;
    }

    if (Array.isArray(data?.detail)) {
      const firstMessage = data.detail
        .map((item) => item.msg ?? item.message)
        .find(Boolean);
      if (firstMessage) {
        return firstMessage;
      }
    }

    if (typeof data?.message === 'string') {
      return data.message;
    }

    if (!error.response) {
      return 'Cannot reach the backend. Check that Django is running and CORS allows this frontend URL.';
    }

    if (status) {
      return `${fallback} (${status})`;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
