export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  headers: string[];
  data: Record<string, any>[]; // Array of row objects
  status: 'pending' | 'parsed' | 'error';
}

export interface HeaderMapping {
  originalHeader: string;
  targetHeader: string;
  sourceFileId: string;
}

export interface MergedDataRow {
  [key: string]: any;
  _sourceFile: string; // Internal metadata to track source
}

export interface SchemaRecommendation {
  standardHeaders: string[];
  mappings: {
    [originalHeader: string]: string; // Maps "E-mail" -> "Email"
  };
}
