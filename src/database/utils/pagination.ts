export const getSkip = (page: number, perPage: number) => (page - 1) * perPage;

export const getLimit = (perPage: number) => perPage + 1;
