import { expect } from "chai";

import { FILTER_OPERATOR } from "../constants";
import { IFilter } from "../interfaces";
import { toSimpleMongooseFilter } from "./filter-helper";

describe("filter helper", () => {
  describe("simple mongoose filter", () => {
    it("should parse simple equal filters correctly", () => {
      const filters: IFilter[] = [
        {
          field: "name",
          operator: FILTER_OPERATOR.EQUAL,
          value: "andy",
        },
        {
          field: "email",
          operator: FILTER_OPERATOR.EQUAL,
          value: "andy@gmail.com",
        },
      ];

      const parsedFilter = toSimpleMongooseFilter(filters);

      expect(parsedFilter.name).to.be.equal("andy");
      expect(parsedFilter.email).to.be.equal("andy@gmail.com");
    });

    it("should parse more complex filters correctly", () => {
      const filters: IFilter[] = [
        {
          field: "name",
          operator: FILTER_OPERATOR.STARTS_WITH,
          value: "andy",
        },
        {
          field: "email",
          operator: FILTER_OPERATOR.ENDS_WITH,
          value: "andy@gmail.com",
        },
        {
          field: "age",
          operator: FILTER_OPERATOR.IN,
          value: [20, 30, 40],
        },
      ];

      const parsedFilter = toSimpleMongooseFilter(filters);

      expect(parsedFilter.name).to.be.deep.equal({
        $regex: "^andy.*$",
        $options: "i",
      });

      expect(parsedFilter.email).to.be.deep.equal({
        $regex: ".*andy@gmail.com$",
        $options: "i",
      });

      expect(parsedFilter.age).to.be.deep.equal([20, 30, 40]);
    });

    it("should parse OR operator correctly", () => {
      const filters: IFilter[] = [
        {
          field: null,
          operator: FILTER_OPERATOR.OR,
          value: [
            {
              field: "name",
              operator: FILTER_OPERATOR.EQUAL,
              value: "andy",
            },
            {
              field: "name",
              operator: FILTER_OPERATOR.EQUAL,
              value: "devstic",
            },
          ] as IFilter[],
        },
        {
          field: "email",
          operator: FILTER_OPERATOR.LIKE,
          value: "andy@gmail.com",
        },
      ];

      const parsedFilter = toSimpleMongooseFilter(filters);

      expect(parsedFilter.$or).to.be.deep.equal([
        {
          name: "andy",
        },
        {
          name: "devstic",
        },
      ]);

      expect(parsedFilter.email).to.be.deep.equal({
        $regex: ".*andy@gmail.com.*",
        $options: "i",
      });
    });
  });
});
