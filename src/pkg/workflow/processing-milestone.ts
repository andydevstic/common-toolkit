export interface Step {
  name?: string;
  onFailure?: OnFailure;
}

export interface OnFailure {
  reason: string;
}

export class SingleProcessingMilestone {
  protected _steps: Step[];
  protected _isFinished = false;

  constructor(
    protected pipelineName?: string,
    protected logger?: (msg: string) => void
  ) {}

  protected throwIfEnded() {
    if (this._isFinished) {
      throw new Error("pipeline has already ended");
    }
  }

  public get totalSteps(): number {
    this.throwIfEnded();

    return this._steps.length;
  }

  public addStep(name?: string, onFailure?: OnFailure): void {
    this.throwIfEnded();
    const stepNo = this.totalSteps + 1;

    this._steps.push({
      name: name || `step_${stepNo}`,
      onFailure: onFailure || {
        reason: "unknown",
      },
    });

    if (this.pipelineName && this.logger) {
      this.logger(`step ${stepNo} of pipeline ${this.pipelineName} reached!`);
    }
  }

  public result(): Step {
    this.throwIfEnded();

    this._isFinished = true;

    return this._steps.pop();
  }
}
