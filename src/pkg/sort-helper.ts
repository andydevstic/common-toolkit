import { ISort, SORT_DIRECTION } from "../interfaces";

export const toMongooseSort = (sorts: ISort[]): Record<string, number> => {
  return sorts.reduce((agg, current) => {
    agg[current.columnName] = current.direction === "ASC" ? 1 : -1;

    return agg;
  }, {});
};

export const toTypeOrmSort = (
  sorts: ISort[]
): Record<string, SORT_DIRECTION> => {
  return sorts.reduce((agg, current) => {
    agg[current.columnName] = current.direction;

    return agg;
  }, {});
};
