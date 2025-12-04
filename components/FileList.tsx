import React from 'react';
import { FileSpreadsheet, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { UploadedFile } from '../types';

interface FileListProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
}

const FileList: React.FC<FileListProps> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  return (
    <div className="w-full space-y-3 mt-6">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
        Uploaded Files ({files.length})
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="relative flex items-center p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
          >
            <div className={`p-2 rounded-lg mr-3 ${
              file.status === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
            }`}>
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {file.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{(file.size / 1024).toFixed(1)} KB</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>{file.data.length} rows</span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(file.id);
              }}
              className="ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Remove file"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {file.status === 'parsed' && (
              <div className="absolute top-2 right-2 text-green-500 opacity-20 group-hover:opacity-0 transition-opacity">
                 <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
