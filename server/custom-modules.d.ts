// Minimal ambient module declarations to satisfy TypeScript without @types packages

declare module "jsonwebtoken" {
  export function sign(
    payload: any,
    secretOrPrivateKey: string,
    options?: any
  ): string;
  export function verify(token: string, secretOrPublicKey: string): any;
}

declare module "bcryptjs" {
  export function hashSync(
    data: string,
    saltOrRounds?: number | string
  ): string;
  export function compareSync(data: string, encrypted: string): boolean;
}

declare module "multer" {
  interface StorageEngine {}
  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  }
  interface MulterOptions {
    storage?: StorageEngine;
    limits?: { fileSize?: number };
  }
  interface Multer {
    single(field: string): any;
  }
  function multer(opts?: MulterOptions): Multer;
  namespace multer {
    function memoryStorage(): StorageEngine;
  }
  export = multer;
}

declare module "xlsx" {
  export type WorkBook = any;
  export type WorkSheet = any;
  export const utils: {
    json_to_sheet: (data: any[]) => WorkSheet;
    book_new: () => WorkBook;
    book_append_sheet: (wb: WorkBook, ws: WorkSheet, name: string) => void;
    sheet_to_json: (ws: WorkSheet) => any[];
  };
  export function read(
    data: Buffer | ArrayBuffer | string,
    opts?: any
  ): WorkBook;
  export function write(wb: WorkBook, opts?: any): any;
}
