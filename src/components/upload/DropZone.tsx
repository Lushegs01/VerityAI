import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import { Upload, FileImage, FileText, FileUp } from 'lucide-react'

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
  label = 'Upload Verification Document',
  sublabel = 'Drag & drop, or click to browse a certificate, transcript or ID',
}: DropZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect],
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  })

  return (
    <motion.div whileHover={{ scale: 1.002 }} whileTap={{ scale: 0.998 }}>
      <div
        {...getRootProps()}
        className={`
          group relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center
          transition-all duration-200 overflow-hidden
          ${isDragActive && !isDragReject
            ? 'border-primary bg-primary/10 shadow-glow'
            : isDragReject
              ? 'border-status-fake bg-status-fake/5'
              : 'border-surface-border bg-surface-card hover:border-primary/50 hover:bg-surface-hover/60'
          }
        `}
      >
        <input {...getInputProps()} />

        {!isDragReject && (
          <div className="pointer-events-none absolute inset-0 -z-0">
            <div className="absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        )}

        <motion.div
          animate={isDragActive ? { y: [0, -6, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          className="relative z-10"
        >
          <div
            className={`
              mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl border
              ${isDragActive
                ? 'border-primary/30 bg-primary/15 text-primary shadow-glow'
                : 'border-surface-border bg-surface-elevated text-ink-secondary'
              }
            `}
          >
            {isDragActive ? <FileUp size={26} /> : <Upload size={26} />}
          </div>

          <p className="font-display text-base font-semibold text-ink-primary">{label}</p>
          <p className="mt-1 text-sm text-ink-muted">{sublabel}</p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-surface-border bg-surface-elevated px-2 py-1 text-[10px] font-medium text-ink-secondary">
              <FileImage size={11} className="text-accent-cyan" />
              JPG, PNG, WEBP
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-surface-border bg-surface-elevated px-2 py-1 text-[10px] font-medium text-ink-secondary">
              <FileText size={11} className="text-accent-emerald" />
              PDF
            </span>
            <span className="inline-flex items-center rounded-md border border-surface-border bg-surface-elevated px-2 py-1 text-[10px] font-medium text-ink-muted">
              Max {(maxSize / 1024 / 1024).toFixed(0)}MB
            </span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
