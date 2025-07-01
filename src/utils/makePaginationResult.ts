import { PaginationResult } from "./paginationResult";

export function makePaginationResult<T>(
  data: T[],
  total: number,
  take: number,
  currentPage: number
): PaginationResult<T> {
  return {
    data,
    limit: take,
    total,
    totalPages: Math.ceil(total / take),
    currentPage,
  };
}
