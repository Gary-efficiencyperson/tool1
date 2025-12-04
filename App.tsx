import React, { useState, useCallback } from 'react';
import { UploadedFile, MergedDataRow } from './types';
import { parseExcelFile, exportToExcel } from './services/excelService';
import { analyzeHeadersWithGemini } from './services/geminiService';
import Dropzone from './components/Dropzone';
import FileList from './components/FileList';
import PreviewTable from './components/PreviewTable';
import { Wand2, Download, Table2, Layers, AlertTriangle } from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [mergedData, setMergedData] = useState<MergedDataRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'preview'>('upload');
  const [aiError, setAiError] = useState<string | null>(null);

  const handleFilesSelected = async (selectedFiles: File[]) => {
    setIsProcessing(true);
    try {
      const parsedFiles = await Promise.all(selectedFiles.map(parseExcelFile));
      setFiles((prev) => [...prev, ...parsedFiles]);
    } catch (error) {
      console.error("Error parsing files:", error);
      alert("Failed to parse some files.");
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    // Reset merged data if source files change to avoid confusion
    if (mergedData.length > 0) {
      setMergedData([]);
      setActiveTab('upload');
    }
  };

  const performMerge = useCallback(async (useAI: boolean) => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setAiError(null);

    try {
      // 1. Collect all headers from all files
      const allHeaders = files.flatMap(f => f.headers);

      let mapping: Record<string, string> = {};
      let standardHeaders: string[] = [];

      if (useAI) {
        try {
          // 2a. Use Gemini to map headers
          const aiResult = await analyzeHeadersWithGemini(allHeaders);
          mapping = aiResult.mappings;
          standardHeaders = aiResult.standardHeaders;
        } catch (e) {
            console.error(e);
            setAiError("AI mapping failed (check API Key). Falling back to direct text matching.");
            // Fallback to identity mapping
            const unique: string[] = Array.from(new Set(allHeaders));
            unique.forEach(h => { mapping[h] = h; });
            standardHeaders = unique;
        }
      } else {
        // 2b. Exact match (identity mapping)
        const unique: string[] = Array.from(new Set(allHeaders));
        unique.forEach(h => { mapping[h] = h; });
        standardHeaders = unique;
      }

      // 3. Transform data based on mapping
      const merged: MergedDataRow[] = [];

      files.forEach(file => {
        file.data.forEach(row => {
          const newRow: MergedDataRow = { _sourceFile: file.name };
          
          // Initialize all standard columns to empty string or null
          standardHeaders.forEach(h => newRow[h] = "");

          // Map values
          Object.keys(row).forEach(originalKey => {
            const targetKey = mapping[originalKey];
            if (targetKey) {
              newRow[targetKey] = row[originalKey];
            } else {
               // If a key wasn't in the mapping (rare if logic is correct), keep it? 
               // For now, only mapped keys are kept to enforce schema.
            }
          });
          merged.push(newRow);
        });
      });

      setMergedData(merged);
      setActiveTab('preview');

    } catch (error) {
      console.error("Merge error:", error);
      alert("An unexpected error occurred during merging.");
    } finally {
      setIsProcessing(false);
    }
  }, [files]);

  const handleExport = () => {
    if (mergedData.length === 0) return;
    exportToExcel(mergedData, `merged_data_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Table2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Smart<span className="text-blue-600">Excel</span>Merger
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             {mergedData.length > 0 && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Export File
                </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Progress / Steps */}
        <div className="mb-8 flex items-center justify-center">
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                <button 
                  onClick={() => setActiveTab('upload')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'upload' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Layers className="w-4 h-4" />
                    1. Upload & Merge
                </button>
                <button 
                   onClick={() => mergedData.length > 0 && setActiveTab('preview')}
                   disabled={mergedData.length === 0}
                   className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'preview' ? 'bg-blue-50 text-blue-700' : 'text-slate-500'} ${mergedData.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:text-slate-700'}`}
                >
                    <Table2 className="w-4 h-4" />
                    2. Preview Data
                </button>
            </div>
        </div>

        {activeTab === 'upload' && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Files</h2>
                <p className="text-slate-500">
                  Select the Excel files you want to combine. We can match columns automatically using AI.
                </p>
              </div>

              <Dropzone onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />
              
              <FileList files={files} onRemove={removeFile} />

              {files.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <button
                      onClick={() => performMerge(false)}
                      disabled={isProcessing}
                      className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50"
                    >
                      Simple Merge (Exact Match)
                    </button>
                    
                    <button
                      onClick={() => performMerge(true)}
                      disabled={isProcessing}
                      className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-200 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <div className="flex items-center gap-2">
                        <Wand2 className="w-4 h-4 animate-pulse" />
                        <span>Smart Merge with AI</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" style={{ display: isProcessing ? 'block' : 'none' }}></div>
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-center text-slate-400">
                    Smart Merge uses Gemini AI to identify and map similar headers (e.g. "Email" = "E-mail Addr").
                  </p>
                  
                  {aiError && (
                    <div className="mt-4 p-3 bg-orange-50 text-orange-700 text-sm rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {aiError}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-end mb-4">
                 <h2 className="text-2xl font-bold text-slate-800">Merged Result</h2>
                 <p className="text-slate-500 text-sm">Total Rows: <span className="font-mono font-medium text-slate-900">{mergedData.length}</span></p>
             </div>
             <PreviewTable data={mergedData} />
          </div>
        )}

      </main>
    </div>
  );
}