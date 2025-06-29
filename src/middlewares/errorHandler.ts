import { NextFunction, Response, Request } from "express";
import { StatusCodes } from "http-status-codes";
import { CustomError } from "../utils/customError";

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err); // Log the error for debugging purposes

  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR; // Use error's status code if available, otherwise 500
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({ statusCode: statusCode, message: message, data: null });
};

export { errorHandler };
