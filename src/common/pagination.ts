export const getSkip = (page: number, perPage: number) => (page - 1) * perPage;

export const getLimit = (perPage: number) => perPage + 1;

export const hasNextPage = <T>(items: T[], perPage: number) => items.length > perPage;

export const hasPreviousPage = (page: number) => page > 1;

export const getItems = <T>(items: T[], perPage: number) => items.slice(0, perPage);

export const getTotalPages = (totalItems: number, perPage: number) => Math.max(1, Math.ceil(totalItems / perPage));

export const getPageInfo = <T>(page: number, perPage: number, items: T[], totalItems: number) => ({
  totalPages: getTotalPages(totalItems, perPage),
  hasNextPage: hasNextPage(items, perPage),
  hasPreviousPage: hasPreviousPage(page),
});
