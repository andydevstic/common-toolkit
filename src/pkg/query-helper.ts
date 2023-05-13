import { ISort } from "../interfaces";

/**
 * Parses a sort data such as "-price name date" into an array of generic sort data
 * @param data the sort string
 * @returns ISort[]
 */
export function parseSort(data: string): ISort[] {
  if (!data) {
    return [];
  }

  const sortConditions: ISort[] = data.split(" ").map((item) => {
    if (item[0] === "-") {
      return {
        columnName: item.slice(1, item.length - 1),
        direction: "DESC",
      };
    }

    return {
      columnName: item,
      direction: "ASC",
    };
  });

  return sortConditions;
}
