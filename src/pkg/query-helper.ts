import { FILTER_OPERATOR } from "../constants";
import { IFilter, ISort } from "../interfaces";

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

export function parseFilter(field: string, filterData: string): IFilter {
  if (!filterData) {
    throw new Error("missing filter data");
  }

  const splittedData = filterData.split(":");
  if (splittedData.length === 1) {
    return {
      field,
      operator: FILTER_OPERATOR.EQUAL,
      value: splittedData[0],
    };
  }

  if (splittedData.length === 2) {
    const [operator, value] = splittedData;

    if (!Object.keys(FILTER_OPERATOR).includes(operator)) {
      throw new Error(`invalid filter operator ${operator}`);
    }

    if (operator === FILTER_OPERATOR.OR || operator === FILTER_OPERATOR.AND) {
      throw new Error("operator $or and $and are only for internal use");
    }

    if (
      operator === FILTER_OPERATOR.IN ||
      operator === FILTER_OPERATOR.NOT_IN
    ) {
      return {
        field,
        operator: operator as FILTER_OPERATOR,
        value: value.split(","),
      };
    }

    return {
      field,
      operator: operator as FILTER_OPERATOR,
      value,
    };
  }
}
