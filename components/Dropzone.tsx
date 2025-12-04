import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
    // Reset value so same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(
      f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv')
    );
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    } else {
      alert("Please upload valid Excel (.xlsx, .xls) files.");
    }
  };

  return (
    <div
      onClick={() => !isProcessing && fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer
        flex flex-col items-center justify-center
        w-full h-48 rounded-2xl border-2 border-dashed
        transition-all duration-300 ease-in-out
        ${isDragging 
          ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
          : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        }
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        style={{ display: 'none' }} 
        multiple
        accept=".xlsx, .xls, .csv"
        disabled={isProcessing}
      />
      
      <div className="flex flex-col items-center gap-3 text-slate-500 group-hover:text-blue-600 transition-colors">
        <div className="p-4 bg-white rounded-full shadow-sm ring-1 ring-slate-200 group-hover:ring-blue-200 group-hover:shadow-md transition-all">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium">
            {isProcessing ? 'Processing files...' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Supports .xlsx, .xls (Multiple files allowed)
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dropzone;