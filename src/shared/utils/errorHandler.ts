/**
 * @file errorHandler.ts
 * @description Error handling utilities
 * @author Kindy
 * @created 2025-11-16
 */
import axios from 'axios';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: any): ApiError {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.message || 'Something went wrong';
    return new ApiError(statusCode, message, error.response?.data);
  }
  return new ApiError(500, error.message || 'An unexpected error occurred');
}

