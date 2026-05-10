import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Zap, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import DropZone from '@/components/upload/DropZone'
import VerdictCard from '@/components/trust/VerdictCard'
import TrustScoreRing from '@/components/trust/TrustScoreRing'
import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/providers/trpc'

export default function Verify() {
  const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [certificateType, setCertificateType] = useState('')
  const [applicantName, setApplicantName] = useState('')
  const [stage, setStage] = useState<'upload' | 'processing' | 'result'>('upload')
  const [processingStage, setProcessingStage] = useState('')
  const [result, setResult] = useState<any>(null)

  const balance = parseFloat(user?.walletBalance || '0')
  const canVerify = balance >= 500

  const processMutation = trpc.verification.process.useMutation({
    onSuccess: (data) => {
      setResult(data)
      setStage('result')
    },
    onError: (err) => {
      toast.error(err.message)
      setStage('upload')
    },
  })

  const onFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile)
    const url = URL.createObjectURL(selectedFile)
    setPreviewUrl(url)
  }, [])

  const handleVerify = async () => {
    if (!file || !canVerify) return

    setStage('processing')
    const stages = [
      'Preprocessing image...',
      'Running AI forensics...',
      'Analyzing document integrity...',
      'Cross-validating data...',
      'Calculating trust score...',
    ]

    let stageIndex = 0
    const stageInterval = setInterval(() => {
      if (stageIndex < stages.length) {
        setProcessingStage(stages[stageIndex])
        stageIndex++
      }
    }, 2000)

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1]
      processMutation.mutate({
        fileName: file.name,
        fileType: file.type,
        fileData: base64,
        certificateType: certificateType || undefined,
        applicantName: applicantName || undefined,
      })
    }
    reader.readAsDataURL(file)

    setTimeout(() => clearInterval(stageInterval), 12000)
  }

  const reset = () => {
    setFile(null)
    setPreviewUrl(null)
    setStage('upload')
    setResult(null)
    setCertificateType('')
    setApplicantName('')
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="font-display text-2xl text-ink-primary flex items-center gap-3">
          <ShieldCheck size={24} className="text-primary" />
          Verify Certificate
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Upload any Nigerian academic certificate for AI-powered verification.
        </p>
      </motion.div>

      {/* Wallet warning */}
      {!canVerify && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 rounded-xl bg-status-fake/5 border border-status-fake/20 flex items-center gap-3"
        >
          <AlertCircle size={18} className="text-status-fake flex-shrink-0" />
          <p className="text-sm text-ink-primary">
            Insufficient wallet balance. You need at least N500 to verify.
            <a href="/wallet" className="text-primary hover:underline ml-1">Top up now</a>
          </p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {stage === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Drop zone */}
            {!file ? (
              <DropZone onFileSelect={onFileSelect} />
            ) : (
              <div className="bg-surface-card border border-surface-border rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  {previewUrl && file.type.startsWith('image/') && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink-primary">{file.name}</p>
                    <p className="text-xs text-ink-muted">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                    className="text-xs text-status-fake hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Certificate details form */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 10 }}
                className="bg-surface-card border border-surface-border rounded-2xl p-6 space-y-4"
              >
                <h3 className="text-sm font-semibold text-ink-primary uppercase tracking-wider">
                  Certificate Details (optional)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-ink-muted mb-1.5">
                      Certificate Type
                    </label>
                    <select
                      value={certificateType}
                      onChange={(e) => setCertificateType(e.target.value)}
                      className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2.5 text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Select type...</option>
                      <option value="WAEC">WAEC</option>
                      <option value="NECO">NECO</option>
                      <option value="NABTEB">NABTEB</option>
                      <option value="BSc">BSc</option>
                      <option value="BA">BA</option>
                      <option value="HND">HND</option>
                      <option value="OND">OND</option>
                      <option value="NYSC">NYSC</option>
                      <option value="ICAN">ICAN</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-ink-muted mb-1.5">
                      Applicant Name
                    </label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="Enter candidate name"
                      className="w-full bg-surface-elevated border border-surface-border rounded-lg px-3 py-2.5 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                {/* Cost + action */}
                <div className="flex items-center justify-between pt-4 border-t border-surface-border">
                  <div>
                    <p className="text-xs text-ink-muted">Verification cost</p>
                    <p className="text-lg font-mono font-bold text-ink-primary">N500.00</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVerify}
                    disabled={!canVerify}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Zap size={16} />
                    Start Verification
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {stage === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <TrustScoreRing
              score={0}
              verdict="SUSPICIOUS"
              size={220}
              processingStage={processingStage || 'Reading document...'}
            />
            <motion.p
              className="mt-6 text-sm text-ink-secondary text-center max-w-xs"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Our AI is analyzing the certificate. This typically takes 10-15 seconds.
            </motion.p>
          </motion.div>
        )}

        {stage === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <VerdictCard certificate={result} />
            <div className="flex justify-center">
              <button
                onClick={reset}
                className="px-6 py-2.5 rounded-xl bg-surface-elevated border border-surface-border text-sm font-medium text-ink-primary hover:bg-surface-hover transition-colors"
              >
                Verify Another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
