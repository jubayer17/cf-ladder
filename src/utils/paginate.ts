export const paginate = <T>(items: T[], page: number, perPage: number) => {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
};
