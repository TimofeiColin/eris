export const hasNextPage = <T>(items: T[], perPage: number) => items.length > perPage;

export const hasPreviousPage = (page: number) => page > 1;

export const getItems = <T>(items: T[], perPage: number) => items.slice(0, perPage);

export const getTotalPages = (totalItems: number, perPage: number) => Math.max(1, Math.ceil(totalItems / perPage));
