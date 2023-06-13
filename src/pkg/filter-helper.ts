import { FILTER_OPERATOR } from "../constants";
import { IFilter } from "../interfaces";

export const toSimpleMongooseFilter = (
  filters: IFilter[]
): Record<string, any> => {
  return filters.reduce((agg, current) => {
    switch (current.operator) {
      case FILTER_OPERATOR.EQUAL:
        agg[current.field] = current.value;

        break;
      case FILTER_OPERATOR.NOT_EQUAL:
        agg[current.field] = {
          $ne: current.value,
        };

        break;

      case FILTER_OPERATOR.NOT:
        agg[current.field] = {
          $ne: current.value,
        };

        break;

      case FILTER_OPERATOR.LIKE:
        agg[current.field] = {
          $regex: `.*${current.value}.*`,
        };

        break;

      case FILTER_OPERATOR.INS_LIKE:
        agg[current.field] = {
          $regex: `.*${current.value}.*`,
          $options: "i",
        };

        break;

      case FILTER_OPERATOR.STARTS_WITH:
        agg[current.field] = {
          $regex: `^${current.value}.*$`,
        };

        break;
      case FILTER_OPERATOR.ENDS_WITH:
        agg[current.field] = {
          $regex: `.*${current.value}$`,
        };

        break;
      case FILTER_OPERATOR.INS_STARTS_WITH:
        agg[current.field] = {
          $regex: `^${current.value}.*$`,
          $options: "i",
        };

        break;
      case FILTER_OPERATOR.INS_ENDS_WITH:
        agg[current.field] = {
          $regex: `.*${current.value}$`,
          $options: "i",
        };

        break;
      case FILTER_OPERATOR.GREATER_THAN:
        agg[current.field] = {
          $gt: current.value,
        };

        break;

      case FILTER_OPERATOR.GREATER_THAN_OR_EQUAL:
        agg[current.field] = {
          $gte: current.value,
        };

        break;

      case FILTER_OPERATOR.LESS_THAN:
        agg[current.field] = {
          $lt: current.value,
        };

        break;

      case FILTER_OPERATOR.LESS_THAN_OR_EQUAL:
        agg[current.field] = {
          $lte: current.value,
        };

        break;

      case FILTER_OPERATOR.IN:
        agg[current.field] = current.value;

        break;

      case FILTER_OPERATOR.NOT_IN:
        agg[current.field] = {
          $nin: current.value,
        };

        break;

      case FILTER_OPERATOR.OR:
        const parsedOr =
          current.value?.map((filterCondition: IFilter) =>
            toSimpleMongooseFilter([filterCondition])
          ) || [];

        if (!parsedOr.length) {
          break;
        }

        agg.$or = parsedOr;

        break;

      case FILTER_OPERATOR.NOR:
        const parsedNor =
          current.value?.map((filterCondition: IFilter) =>
            toSimpleMongooseFilter([filterCondition])
          ) || [];

        if (!parsedNor.length) {
          break;
        }

        agg.$nor = parsedNor;

        break;
    }

    return agg;
  }, {} as Record<string, any>);
};
