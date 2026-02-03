import { Request, Response } from 'express';
import logger from './logger';

export interface AppError extends Error {
  statusCode?: number;
  message: string;
}

export class NotFoundError extends Error implements AppError {
  statusCode = 404;
  message: string;

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.message = message;
  }
}

export class BadRequestError extends Error implements AppError {
  statusCode = 400;
  message: string;

  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
    this.message = message;
  }
}

export class InternalServerError extends Error implements AppError {
  statusCode = 500;
  message: string;

  constructor(message: string = 'Internal server error') {
    super(message);
    this.name = 'InternalServerError';
    this.message = message;
  }
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
  });
}
