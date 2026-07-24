interface PaginationParams {
  page: number;
  limit: number;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

//Prisma skip/take calculate
export const getPagination = (params: PaginationParams) => {
  const page = Math.max(1, params.page);
  const limit = Math.min(50, Math.max(1, params.limit));

  return {
    skip: (page - 1) * limit,
    take: limit,
    page,
    limit,
  };
};

//page meta info for response
export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number,
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
