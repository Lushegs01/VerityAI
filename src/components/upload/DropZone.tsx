import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, FileImage, FileText } from 'lucide-react'

interface DropZoneProps {
  onFileSelect: (file: File) => void
  accept?: Record<string, string[]>
  maxSize?: number
  label?: string
  sublabel?: string
}

export default function DropZone({
  onFileSelect,
  accept = {
    'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
    'application/pdf': ['.pdf'],
  },
  maxSize = 10 * 1024 * 1024,
  label = 'Upload a certificate',
  sublabel = 'Drag and drop or click to browse',
}: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept,
      maxSize,
      multiple: false,
    })

  return (
    <motion.div
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
    >
      <div
        {...getRootProps()}
        className={`
          relative cursor-pointer rounded-lg border border-dashed p-8 text-center
          transition-all duration-200 overflow-hidden
          ${isDragActive && !isDragReject
            ? 'border-primary bg-primary/5'
            : isDragReject
              ? 'border-status-fake bg-status-fake-bg'
              : 'border-surface-border bg-surface-card hover:border-primary/40 hover:bg-surface-hover'
          }
        `}
      >
        <input {...getInputProps()} />

        <motion.div
          animate={isDragActive ? { y: [0, -5, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          className="relative z-10"
        >
          <div className={`
            mx-auto mb-4 flex size-14 items-center justify-center rounded-lg border
            ${isDragActive
              ? 'border-primary/20 bg-primary/10 text-primary'
              : 'border-surface-border bg-surface-elevated text-ink-muted'
            }
          `}>
            <Upload size={24} />
          </div>

          <p className="text-sm font-medium text-ink-primary mb-1">{label}</p>
          <p className="text-xs text-ink-muted">{sublabel}</p>

          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex items-center gap-1.5 rounded-md border border-surface-border bg-surface-elevated px-2 py-1">
              <FileImage size={12} className="text-ink-muted" />
              <span className="text-[10px] text-ink-muted">JPG, PNG, WEBP</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-surface-border bg-surface-elevated px-2 py-1">
              <FileText size={12} className="text-ink-muted" />
              <span className="text-[10px] text-ink-muted">PDF</span>
            </div>
          </div>

          <p className="text-[10px] text-ink-muted mt-2">Max file size: {(maxSize / 1024 / 1024).toFixed(0)}MB</p>
        </motion.div>
      </div>
    </motion.div>
  )
}
