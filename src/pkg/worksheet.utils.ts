import { Worksheet, Cell, Row, Column } from "exceljs";

import { ICellData, ICellOptions } from "../interfaces";

export class WorksheetUtils {
  protected isAlive = true;

  public id: number;

  constructor(protected worksheet: Worksheet) {
    this.id = worksheet.id;
  }

  public markRemoved(): void {
    this.isAlive = false;
  }

  public rename(newName: string): void {
    this.worksheet.name = newName;
  }

  public setRowHeight(rowNumber: number, height: number): void {
    const row = this.getRow(rowNumber);

    row.height = height;
  }

  public setColumnSize(columnName: string, width: number): void {
    const column = this.getColumn(columnName);

    column.width = width;
  }

  public writeCellByAddress(
    cellAddress: string,
    cellData: Partial<ICellData>
  ): Cell {
    const targetCell = this.worksheet.getCell(cellAddress);

    this.writeCell(targetCell, cellData);

    return targetCell;
  }

  public writeRow(
    rowNumber: number,
    startColumnNumber: number,
    writeData: any[]
  ): Row {
    const emptyArrayWithLength = Array(startColumnNumber);
    const rowData = emptyArrayWithLength.concat(writeData);
    const newRow = this.worksheet.insertRow(rowNumber, rowData, "o+");

    newRow.commit();

    return newRow;
  }

  public duplicateRow(rowNumber: number, amount = 1, insert = true): void {
    this.worksheet.duplicateRow(rowNumber, amount, insert);
  }

  public mergeCells(
    startCellName: string,
    endCellName: string,
    ignoreStyle?: boolean
  ): void {
    this.throwIfNotAlive();

    return this.worksheet.mergeCells(`${startCellName}:${endCellName}`);
  }

  public getRow(rowNumber1Based: number): Row {
    this.throwIfNotAlive();

    return this.worksheet.getRow(rowNumber1Based);
  }

  public getColumn(columnName: string): Partial<Column> {
    this.throwIfNotAlive();

    return this.worksheet.getColumn(columnName);
  }

  public commit(): void {
    this.worksheet.commit();
  }

  public getColumnData(columnName: string, startIndex = 0): any[] {
    this.throwIfNotAlive();

    const column = this.getColumn(columnName);
    const columnValues = column.values;

    if (!columnValues || !columnValues.length) {
      return [];
    }

    return columnValues.map((i) => i.valueOf()).slice(startIndex);
  }

  public getRowData(
    rowNumber1Based: number,
    startColIndex = 0,
    endColIndex: number
  ): any[] {
    this.throwIfNotAlive();

    const row = this.getRow(rowNumber1Based);
    const rowValues = row.values;

    if (!rowValues || !rowValues.length) {
      return [];
    }

    if (Array.isArray(rowValues)) {
      return rowValues
        .map((cellValue) => cellValue.valueOf())
        .slice(startColIndex, endColIndex);
    } else {
      return Object.values(rowValues)
        .map((i) => i.valueOf())
        .slice(startColIndex, endColIndex);
    }
  }

  protected applyOptionsToCell(cell: Cell, options?: ICellOptions): void {
    const { style, border } = options;

    if (style) {
      cell.style = style;
    }

    if (border) {
      cell.border = border;
    }
  }

  protected writeCell(cell: Cell, cellData: Partial<ICellData>): void {
    const { value, options } = cellData;

    cell.value = value;
    if (options) {
      this.applyOptionsToCell(cell, options);
    }
  }

  protected throwIfNotAlive(): void {
    if (this.isAlive) {
      return;
    }

    throw new Error("Worksheet has been destroyed.");
  }
}
