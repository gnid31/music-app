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
  return {
    page: parseInt(query.page) || 1,
    limit: parseInt(query.limit) || 10,
    maxLimit: parseInt(query.maxLimit) || 20,
  };
}
