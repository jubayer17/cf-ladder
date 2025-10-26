// utils/paginate.ts
export function paginate<T>(items: T[], page: number, perPage: number): T[] {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
}
