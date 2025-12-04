import React from 'react';
import { MergedDataRow } from '../types';

interface PreviewTableProps {
  data: MergedDataRow[];
}

const PreviewTable: React.FC<PreviewTableProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Get all unique keys from the first few rows to build headers
  // In a real merged dataset, all rows should normalized, so taking the keys of row 0 is usually safe
  // providing row 0 has all keys. Better to collect from a sample.
  
  const sampleSize = Math.min(data.length, 50);
  const allKeys = new Set<string>();
  
  for (let i = 0; i < sampleSize; i++) {
    Object.keys(data[i]).forEach(k => {
      if (k !== '_sourceFile') allKeys.add(k);
    });
  }
  
  const headers = Array.from(allKeys).sort();

  return (
    <div className="w-full mt-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[500px]">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Preview Merged Data</h3>
          <p className="text-sm text-slate-500">Showing first {Math.min(data.length, 100)} rows of {data.length} total</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50 min-w-[50px]">
                #
              </th>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50 whitespace-nowrap min-w-[150px]">
                  {header}
                </th>
              ))}
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 bg-slate-50 whitespace-nowrap min-w-[150px]">
                Source File
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.slice(0, 100).map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2 text-xs text-slate-400 font-mono">
                  {idx + 1}
                </td>
                {headers.map((header) => (
                  <td key={header} className="px-4 py-2 text-sm text-slate-700 whitespace-nowrap max-w-[300px] overflow-hidden text-ellipsis">
                    {row[header] !== undefined && row[header] !== null ? String(row[header]) : <span className="text-slate-300">-</span>}
                  </td>
                ))}
                <td className="px-4 py-2 text-xs text-slate-500 italic whitespace-nowrap">
                   {row._sourceFile}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PreviewTable;
