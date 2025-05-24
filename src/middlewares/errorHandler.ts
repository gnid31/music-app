import { NextFunction, Response, Request } from "express";
import { StatusCodes } from "http-status-codes";

class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    // Để giữ đúng prototype chain khi dùng extends Error
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err); // Log the error for debugging purposes

  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR; // Use error's status code if available, otherwise 500
  const message = err.message || "Something went wrong";

  res.status(statusCode).send(message);
};

export { errorHandler, CustomError };
