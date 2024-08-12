import "core-js/modules/es.promise";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.symbol";
import "core-js/modules/es.symbol.async-iterator";
import "regenerator-runtime/runtime"; // For exceljs es5 to work.

import { AddWorksheetOptions, Buffer, Workbook as IWorkbook } from "exceljs";
import * as stream from "stream";
import { WorksheetUtils } from "../pkg/worksheet.utils";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Workbook = require("exceljs/dist/es5/doc/workbook.js");

export class ExcelService {
  protected workbook: IWorkbook;
  protected workSheetMap = new Map() as Map<string, WorksheetUtils>;

  public async loadTemplate(templatePath: string): Promise<this> {
    try {
      if (!templatePath) {
        throw new Error("Missing excel template path");
      }

      const newWorkbook = new Workbook();
      this.workbook = await newWorkbook.xlsx.readFile(templatePath);

      return this;
    } catch (error: any) {
      throw new Error(`Error loading excel template: ${error.message}`);
    }
  }

  public async loadFromBuffer(buffer: Buffer): Promise<this> {
    try {
      if (!buffer || !buffer.byteLength) {
        throw new Error("Excel buffer is empty!");
      }

      const newWorkbook = new Workbook();
      this.workbook = await newWorkbook.xlsx.load(buffer);

      return this;
    } catch (error: any) {
      throw new Error(`Error loading excel from buffer: ${error.message}`);
    }
  }

  public addWorkSheet(
    workSheetName: string,
    options?: Partial<AddWorksheetOptions>
  ): WorksheetUtils {
    const newWorksheet = this.workbook.addWorksheet(workSheetName, options);
    const wrappedWorksheet = new WorksheetUtils(newWorksheet);

    this.workSheetMap.set(workSheetName, wrappedWorksheet);

    return wrappedWorksheet;
  }

  public getWorkSheet(workSheetName: string): WorksheetUtils {
    const worksheet = this.workbook.getWorksheet(workSheetName);

    if (worksheet) {
      const newWorkSheetUtil = new WorksheetUtils(worksheet);
      this.workSheetMap.set(workSheetName, newWorkSheetUtil);

      return newWorkSheetUtil;
    }

    return this.addWorkSheet(workSheetName);
  }

  public writeToStream(readStream: stream.Stream): Promise<void> {
    return this.workbook.xlsx.write(readStream);
  }

  public writeToFile(path: string): Promise<void> {
    return this.workbook.xlsx.writeFile(path);
  }

  public write(stream: stream.Stream): Promise<void> {
    return this.writeToStream(stream);
  }

  public writeToBuffer(): Promise<Buffer> {
    return this.workbook.xlsx.writeBuffer();
  }

  public removeWorkSheet(worksheet: WorksheetUtils): void {
    worksheet.markRemoved();
    return this.workbook.removeWorksheet(worksheet.id);
  }

  protected throwIfTemplateNotLoaded(): void {
    if (this.workbook) {
      return;
    }

    throw new Error("Template not loaded. Please load template.");
  }
}
