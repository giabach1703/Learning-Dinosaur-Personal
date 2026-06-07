import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
}

function errorMiddleware(error: CustomError, req: Request, res: Response, next: NextFunction) {
  console.error(error);

  return res.status(error.statusCode || 500).json({
    message: error.message || 'Lỗi hệ thống',
  });
}

export default errorMiddleware;
