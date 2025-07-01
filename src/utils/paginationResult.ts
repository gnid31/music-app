export interface PaginationResult<T> {
  data: T[];
  limit: number;
  total: number;
  totalPages: number;
  currentPage: number;
}
