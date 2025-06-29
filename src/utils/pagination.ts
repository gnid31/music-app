import { CustomError } from "./customError";
import { StatusCodes } from "http-status-codes";

export interface PaginationParams {
  playlistId?: number;
  userId?: number;
  keyword?: string;
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export function getPagination({
  page = 1,
  limit = 10,
  maxLimit = 20,
}: PaginationParams = {}) {
  const take = Math.min(limit, maxLimit);
  const skip = (page - 1) * take;
  return { skip, take, currentPage: page };
}

export function parsePaginationParams(query: any): PaginationParams {
  let page = parseInt(query.page);
  let limit = parseInt(query.limit);

  if (query.page !== undefined && (isNaN(page) || page < 1)) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Page must be a positive integer if provided.");
  }
  if (query.limit !== undefined && (isNaN(limit) || limit < 1)) {
    throw new CustomError(StatusCodes.BAD_REQUEST, "Limit must be a positive integer if provided.");
  }

  return {
    page: isNaN(page) ? 1 : page,
    limit: isNaN(limit) ? 10 : limit,
    maxLimit: parseInt(query.maxLimit) || 20,
  };
}
