export interface Step {
  name?: string;
  onFailure?: OnFailure;
}

export interface OnFailure {
  reason: string;
}

export class SingleProcessingMilestone {
  protected _steps: Step[];

  constructor(
    protected pipelineName?: string,
    protected logger?: (msg: string) => void
  ) {}

  public get totalSteps(): number {
    return this._steps.length;
  }

  public addStep(name?: string, onFailure?: OnFailure): void {
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
}
