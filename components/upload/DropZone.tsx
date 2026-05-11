import React, { useCallback, useState } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface DropZoneProps {
  onFileSelect: (file: File | null) => void;
  accept?: Accept;
  maxSize?: number;
}

export function DropZone({ onFileSelect, accept = { 'image/*': ['.jpeg', '.jpg', '.png'], 'application/pdf': ['.pdf'] }, maxSize = 10 * 1024 * 1024 }: DropZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    if (fileRejections.length > 0) {
      const rej = fileRejections[0];
      if (rej.errors[0].code === 'file-too-large') {
        setError('File is too large (max 10MB)');
      } else {
        setError('Invalid file type. Please upload an image or PDF.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setError(null);
      onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false
  } as any);

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    onFileSelect(null);
  };

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-10 transition-all cursor-pointer group flex flex-col items-center justify-center text-center",
          isDragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-surface-border bg-surface-base hover:border-ink-muted/50 hover:bg-surface-card",
          file ? "border-status-verified/50 bg-status-verified-bg/20" : ""
        )}
      >
        <input {...getInputProps()} />
        
        {file ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-status-verified/10 flex items-center justify-center mb-4 border border-status-verified/20">
              <FileText className="w-8 h-8 text-status-verified" />
            </div>
            <p className="text-sm font-bold text-ink-primary mb-1">{file.name}</p>
            <p className="text-[10px] font-mono text-ink-muted uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB • READY FOR ANALYSIS</p>
            
            <button 
              onClick={removeFile}
              className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-elevated border border-surface-border text-[10px] font-mono font-bold text-ink-muted hover:text-status-fake hover:border-status-fake transition-all uppercase tracking-widest"
            >
              <X className="w-3 h-3" /> Remove File
            </button>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-surface-border flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all">
              <Upload className="w-8 h-8 text-ink-muted group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-xl font-display font-bold mb-2 uppercase tracking-tight">Drop Certificate Here</h3>
            <p className="text-sm text-ink-secondary max-w-xs font-medium leading-relaxed">
              Drag and drop your document (PDF, PNG, JPG) or click to browse. Max size 10MB.
            </p>
          </>
        )}

        {error && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-mono font-black text-status-fake uppercase tracking-widest bg-status-fake-bg px-3 py-1 rounded-full border border-status-fake/20 animate-bounce">
            <AlertCircle className="w-3 h-3" /> {error}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 px-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] font-mono font-bold text-ink-muted uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-status-verified" /> AES-256</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-status-verified" /> PII Purge</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-status-verified" /> ISO/IEC 27001</span>
        </div>
      </div>
    </div>
  );
}
