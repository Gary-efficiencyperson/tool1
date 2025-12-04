import * as XLSX from 'xlsx';
import { UploadedFile, MergedDataRow } from '../types';

export const parseExcelFile = async (file: File): Promise<UploadedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Assume data is in the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });
        
        // Extract headers
        let headers: string[] = [];
        if (jsonData.length > 0) {
          headers = Object.keys(jsonData[0]);
        }

        resolve({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          headers,
          data: jsonData,
          status: 'parsed',
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const exportToExcel = (data: MergedDataRow[], filename: string = 'merged_data.xlsx') => {
  // Remove internal metadata key before export
  const cleanData = data.map(row => {
    const { _sourceFile, ...rest } = row;
    return rest;
  });

  const worksheet = XLSX.utils.json_to_sheet(cleanData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Merged Data");
  
  XLSX.writeFile(workbook, filename);
};
