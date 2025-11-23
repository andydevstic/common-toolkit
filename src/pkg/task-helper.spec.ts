// test/runWithTimeout.spec.ts
// Adjust the import path below if your helper is in a different location.
import { expect } from "chai";
import sinon from "sinon";
import { runWithTimeout } from "./task-helper"; // <-- adjust path if needed

// small helpers
const delayResolve = (value: any, ms: number) => () =>
  new Promise((res) => {
    setTimeout(() => res(value), ms);
  });

const delayReject = (err: Error, ms: number) => () =>
  new Promise((_, rej) => {
    setTimeout(() => rej(err), ms);
  });

describe("runWithTimeout (TypeScript)", () => {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it("resolves when handler completes before timeout", async () => {
    const handler = delayResolve("ok", 10);
    const p = runWithTimeout(handler, 50);

    // advance time to trigger resolve
    await clock.tickAsync(20);

    const result = await p;
    expect(result).to.equal("ok");
  });

  it("rejects when handler rejects before timeout", async () => {
    const handler = delayReject(new Error("boom"), 10);
    const p = runWithTimeout(handler, 50);

    await clock.tickAsync(20);

    try {
      await p;
      throw new Error("expected to reject");
    } catch (err: any) {
      expect(err).to.be.instanceOf(Error);
      expect(err.message).to.equal("boom");
    }
  });

  it('rejects with "task timed out" when handler does not complete before timeout', async () => {
    // handler never resolves/rejects
    const handler = () => new Promise(() => {});
    const p = runWithTimeout(handler, 50);

    await clock.tickAsync(60);

    try {
      await p;
      throw new Error("expected to reject by timeout");
    } catch (err: any) {
      expect(err).to.be.instanceOf(Error);
      expect(err.message).to.equal("task timed out");
    }
  });

  it("calls onCompletedAfterReject when handler resolves after timeout", async () => {
    const handler = delayResolve("late-result", 100);
    const onCompletedAfterReject = sinon.spy();

    const p = runWithTimeout(handler, 50, onCompletedAfterReject);

    // move past timeout so runWithTimeout rejects first
    await clock.tickAsync(60);

    // ensure the original promise already rejected
    try {
      await p;
      throw new Error("expected to reject by timeout");
    } catch (err: any) {
      expect(err).to.be.instanceOf(Error);
      expect(err.message).to.equal("task timed out");
    }

    // now advance to when handler resolves
    await clock.tickAsync(50);

    // sinon's fake timers' tickAsync awaits microtasks, so the spy should have been called
    expect(onCompletedAfterReject.calledOnce).to.equal(true);
    expect(onCompletedAfterReject.calledWith("late-result")).to.equal(true);
  });

  it("does NOT call onCompletedAfterReject when handler resolves before timeout", async () => {
    const handler = delayResolve("fast", 10);
    const onCompletedAfterReject = sinon.spy();

    const p = runWithTimeout(handler, 50, onCompletedAfterReject);

    await clock.tickAsync(20);

    const result = await p;
    expect(result).to.equal("fast");
    expect(onCompletedAfterReject.notCalled).to.equal(true);
  });

  it("clears timeout when handler resolves before timeout (no lingering timers)", async () => {
    const handler = delayResolve("fast", 10);
    const p = runWithTimeout(handler, 50);

    await clock.tickAsync(20);
    const result = await p;
    expect(result).to.equal("fast");

    // advance much further — nothing should happen or throw
    await clock.tickAsync(1000);
  });
});
