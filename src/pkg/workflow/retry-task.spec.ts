import chai from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

const expect = chai.expect;

import { RetryTask } from "./retry-task";

describe("retry task", () => {
  describe("success cases", () => {
    it("it should resolve correct data if no error occurs", async () => {
      const task = () =>
        new Promise((resolve, reject) => {
          setTimeout(() => resolve("hello world"), 100);
        });

      const data = "hello world";

      const retryTask = new RetryTask(task, {
        retryCount: 3,
        taskName: data,
        returnOperationResult: true,
      });

      const result = await retryTask.run();

      expect(result.success).to.exist;
      expect(result.success).to.be.true;
      expect(result.data).to.be.eq(data);
    });

    it("it should resolve operation result with data if no error occurs", async () => {
      const task = () =>
        new Promise((resolve, reject) => {
          setTimeout(() => resolve("hello world"), 100);
        });

      const data = "hello world";

      const retryTask = new RetryTask(task, {
        retryCount: 3,
        taskName: data,
      });

      const result = await retryTask.run();

      expect(result).to.be.eq(data);
    });

    it("it should resolve correct data if error occurs within retry count", async () => {
      let retryCount = 0;
      const task = () =>
        new Promise((resolve, reject) => {
          setTimeout(() => {
            retryCount++;
            retryCount === 2 ? resolve("hello world") : reject("not time yet");
          }, 100);
        });

      const data = "hello world";

      const retryTask = new RetryTask(task, {
        retryCount: 3,
        taskName: data,
        retryIntervalInMs: 300,
      });

      const result = await retryTask.run((err) => console.log(err));

      expect(result).to.be.eq(data);
    });

    it("should pass if operation result is successful", async () => {
      const data = "hello world";

      const task = () =>
        new Promise((resolve, reject) => {
          setTimeout(
            () =>
              resolve({
                success: true,
                data,
              }),
            100
          );
        });

      const retryTask = new RetryTask(task, {
        retryCount: 3,
        taskName: data,
      });

      const result = await retryTask.run();

      expect(result?.data).to.be.eq(data);
    });
  });

  describe("failure cases", () => {
    it("throws if retry count is exceeded", async () => {
      const task = () =>
        new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error("always fail!")), 100);
        });

      const data = "hello world";

      const retryTask = new RetryTask(task, {
        retryCount: 3,
        taskName: data,
        retryIntervalInMs: 300,
      });

      await expect(retryTask.run()).to.be.rejectedWith(
        "retry task hello world failed after 3 retries"
      );
    });

    it("returns failed operation result if retry count is exceeded", async () => {
      const task = () =>
        new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error("always fail!")), 100);
        });

      const data = "hello world";

      const retryTask = new RetryTask(task, {
        retryCount: 3,
        taskName: data,
        retryIntervalInMs: 300,
        returnOperationResult: true,
      });

      const failedResult = await retryTask.run();
      expect(failedResult.success).to.exist;
      expect(failedResult.success).to.be.false;
    });

    it("throws if retry count is exceeded when operation result failed", async () => {
      const task = () =>
        new Promise((resolve, reject) => {
          setTimeout(
            () =>
              resolve({
                success: false,
                message: "failed for some reason",
              }),
            100
          );
        });

      const taskName = "hello world";

      const retryTask = new RetryTask(task, {
        retryCount: 3,
        taskName,
        retryIntervalInMs: 300,
      });

      await expect(retryTask.run()).to.be.rejectedWith(
        "retry task hello world failed after 3 retries"
      );
    });

    it("returns failed operation result if retry count is exceeded when operation result failed", async () => {
      const task = () =>
        new Promise((resolve, reject) => {
          setTimeout(
            () =>
              resolve({
                success: false,
                message: "failed for some reason",
              }),
            100
          );
        });

      const taskName = "hello world";

      const retryTask = new RetryTask(task, {
        retryCount: 3,
        taskName,
        retryIntervalInMs: 300,
        returnOperationResult: true,
      });

      const failedResult = await retryTask.run();

      expect(failedResult.success).to.exist;
      expect(failedResult.success).to.be.false;
    });
  });
});
