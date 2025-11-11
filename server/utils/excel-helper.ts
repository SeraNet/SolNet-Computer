import ExcelJS from "exceljs";

// Type definitions for compatibility with xlsx-style API
export interface XLSXWorksheet extends ExcelJS.Worksheet {
  "!cols"?: Array<{ width?: number; hidden?: boolean }>;
}

export interface XLSXWorkbook extends ExcelJS.Workbook {
  Sheets?: { [key: string]: XLSXWorksheet };
  SheetNames?: string[];
}

// Helper functions to replace XLSX functionality with ExcelJS

export function createWorkbook(): ExcelJS.Workbook {
  return new ExcelJS.Workbook();
}

export function addWorksheet(
  workbook: ExcelJS.Workbook,
  name: string,
  data: any[]
): ExcelJS.Worksheet {
  const worksheet = workbook.addWorksheet(name);

  if (data.length === 0) return worksheet;

  // Add headers
  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);

  // Add data rows
  data.forEach((row) => {
    const rowData = headers.map((header) => row[header] || "");
    worksheet.addRow(rowData);
  });

  return worksheet;
}

export async function writeWorkbookToBuffer(
  workbook: ExcelJS.Workbook
): Promise<Buffer> {
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function readWorkbookFromBuffer(
  buffer: Buffer
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);
  return workbook;
}

export function getWorksheetData(worksheet: ExcelJS.Worksheet): any[] {
  const data: any[] = [];
  const headers: string[] = [];

  // Get headers from first row
  const firstRow = worksheet.getRow(1);
  firstRow.eachCell((cell, colNumber) => {
    headers[colNumber - 1] = cell.value?.toString() || `Column${colNumber}`;
  });

  // Get data from remaining rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header row

    const rowData: any = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1];
      if (header) {
        rowData[header] = cell.value;
      }
    });
    data.push(rowData);
  });

  return data;
}

export function createWorksheetFromJson(
  data: any[],
  name: string
): { workbook: ExcelJS.Workbook; worksheet: ExcelJS.Worksheet } {
  const workbook = new ExcelJS.Workbook();
  const worksheet = addWorksheet(workbook, name, data);
  return { workbook, worksheet };
}

// Function to set column widths using ExcelJS API
export function setColumnWidths(
  worksheet: ExcelJS.Worksheet,
  widths: Array<{ width?: number; hidden?: boolean }>
) {
  widths.forEach((col, index) => {
    if (col.width) {
      worksheet.getColumn(index + 1).width = col.width;
    }
    if (col.hidden) {
      worksheet.getColumn(index + 1).hidden = col.hidden;
    }
  });
}

// Compatibility functions to replace XLSX.utils methods
export const utils = {
  book_new: createWorkbook,
  json_to_sheet: (data: any[]): XLSXWorksheet => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1") as XLSXWorksheet;

    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);

      data.forEach((row) => {
        const rowData = headers.map((header) => row[header] || "");
        worksheet.addRow(rowData);
      });
    }

    return worksheet;
  },
  book_append_sheet: (
    workbook: ExcelJS.Workbook,
    worksheet: ExcelJS.Worksheet,
    name: string
  ) => {
    worksheet.name = name;
    return workbook;
  },
  write: async (workbook: ExcelJS.Workbook, options: any) => {
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  },
  read: async (buffer: Buffer, options: any): Promise<XLSXWorkbook> => {
    const workbook = new ExcelJS.Workbook() as XLSXWorkbook;
    await workbook.xlsx.load(buffer as any);

    // Add compatibility properties
    workbook.Sheets = {};
    workbook.SheetNames = [];

    workbook.eachSheet((sheet, id) => {
      workbook.Sheets![sheet.name] = sheet as XLSXWorksheet;
      workbook.SheetNames!.push(sheet.name);
    });

    return workbook;
  },
  sheet_to_json: (worksheet: ExcelJS.Worksheet) => {
    return getWorksheetData(worksheet);
  },
};
