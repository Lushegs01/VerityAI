import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Bell,
  Building2,
  Check,
  Copy,
  Globe,
  Key,
  Mail,
  Plus,
  Settings as SettingsIcon,
  Shield,
  Trash2,
  User as UserIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import { Badge, Button, Field, Panel, Skeleton } from '@/components/ui-system'
import { cn } from '@/lib/utils'

type Section = 'profile' | 'notifications' | 'security' | 'api' | 'danger'

const sections: { id: Section; label: string; icon: typeof UserIcon; description: string }[] = [
  { id: 'profile', label: 'Profile', icon: UserIcon, description: 'Display name, company, contact' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Email + in-app alerts' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Password, sessions, 2FA' },
  { id: 'api', label: 'API Keys', icon: Key, description: 'Programmatic access tokens' },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, description: 'Delete account' },
]

function SectionLabel({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-surface-border bg-surface-elevated px-4 py-3">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-ink-secondary">
        {label}
      </span>
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
        {hint}
      </span>
    </div>
  )
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors',
        checked ? 'bg-primary' : 'bg-surface-border',
      )}
    >
      <span
        className={cn(
          'inline-block size-5 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

/* ---------- Profile ---------- */
function ProfileSection() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.fullName || user?.name || '')
  const [company, setCompany] = useState(user?.companyName || '')
  const [email] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')

  const initial = (name || email || 'U').charAt(0).toUpperCase()

  const save = () => {
    toast.success('Profile saved')
  }

  return (
    <div className="space-y-6">
      <SectionLabel label="Profile / Identity" hint="Personal Details" />

      <Panel className="p-6">
        <div className="flex items-center gap-5">
          <span className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent-cyan text-2xl font-black text-white shadow-md">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-black uppercase tracking-tight text-ink-primary">
              {name || 'Set your name'}
            </p>
            <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              {company || 'No company set'}
            </p>
            <Badge tone="primary" size="sm" className="mt-3">
              {user?.plan?.toUpperCase() || 'FREE'} PLAN
            </Badge>
          </div>
          <Button variant="outline" size="sm">
            Change Avatar
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field
            label="Full Name"
            placeholder="Ada Lovelace"
            value={name}
            leftIcon={<UserIcon size={16} />}
            onChange={(e) => setName(e.target.value)}
          />
          <Field
            label="Company / Organization"
            placeholder="VerityAI Inc."
            value={company}
            leftIcon={<Building2 size={16} />}
            onChange={(e) => setCompany(e.target.value)}
          />
          <Field
            label="Email"
            value={email}
            disabled
            leftIcon={<Mail size={16} />}
            hint="Email is tied to your sign-in provider"
          />
          <Field
            label="Phone"
            placeholder="+234 800 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="outline">Cancel</Button>
          <Button onClick={save} leftIcon={<Check size={16} />}>
            Save Changes
          </Button>
        </div>
      </Panel>
    </div>
  )
}

/* ---------- Notifications ---------- */
function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    emailVerifications: true,
    emailFlagged: true,
    emailWeekly: false,
    productUpdates: false,
    securityAlerts: true,
    apiUsage: true,
  })

  const flip = (k: keyof typeof prefs) => setPrefs((p) => ({ ...p, [k]: !p[k] }))

  const rows: { key: keyof typeof prefs; title: string; body: string }[] = [
    {
      key: 'emailVerifications',
      title: 'Verification Complete',
      body: 'Email me when a verification finishes processing.',
    },
    {
      key: 'emailFlagged',
      title: 'Flagged Documents',
      body: 'Immediate alert when a document is suspicious or likely fake.',
    },
    {
      key: 'emailWeekly',
      title: 'Weekly Digest',
      body: 'Receive a Monday recap of activity, scores, and spend.',
    },
    {
      key: 'productUpdates',
      title: 'Product Updates',
      body: 'New features, model upgrades, and roadmap announcements.',
    },
    {
      key: 'securityAlerts',
      title: 'Security Alerts',
      body: 'Sign-in attempts, API key changes, plan downgrades.',
    },
    {
      key: 'apiUsage',
      title: 'API Usage Spikes',
      body: 'Alert when API traffic exceeds 150% of your daily baseline.',
    },
  ]

  return (
    <div className="space-y-6">
      <SectionLabel label="Notifications / Delivery" hint="Email + In-App" />

      <Panel className="divide-y divide-surface-border">
        {rows.map((row) => (
          <div key={row.key} className="flex items-start justify-between gap-6 p-6">
            <div className="min-w-0">
              <p className="font-display text-sm font-bold uppercase tracking-tight text-ink-primary">
                {row.title}
              </p>
              <p className="mt-1 text-sm text-ink-secondary">{row.body}</p>
            </div>
            <Toggle checked={prefs[row.key]} onChange={() => flip(row.key)} />
          </div>
        ))}
      </Panel>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset to Defaults</Button>
        <Button onClick={() => toast.success('Preferences saved')} leftIcon={<Check size={16} />}>
          Save Preferences
        </Button>
      </div>
    </div>
  )
}

/* ---------- Security ---------- */
function SecuritySection() {
  const sessions = useMemo(
    () => [
      { id: 1, agent: 'Chrome · macOS', loc: 'Lagos, NG', last: 'Active now', current: true },
      { id: 2, agent: 'Safari · iOS', loc: 'Abuja, NG', last: '2 hours ago', current: false },
      { id: 3, agent: 'Firefox · Windows', loc: 'London, UK', last: '3 days ago', current: false },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <SectionLabel label="Security / Sessions" hint="Authentication" />

      <Panel className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-base font-bold uppercase tracking-tight text-ink-primary">
              Two-Factor Authentication
            </p>
            <p className="mt-1 text-sm text-ink-secondary">
              Add a second verification step at sign-in. Recommended for accounts with API access.
            </p>
          </div>
          <Button variant="outline" size="sm">
            Enable 2FA
          </Button>
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        <div className="border-b border-surface-border px-6 py-4">
          <p className="font-display text-base font-bold uppercase tracking-tight text-ink-primary">
            Active Sessions
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
            {sessions.length} device{sessions.length === 1 ? '' : 's'} signed in
          </p>
        </div>
        <ul className="divide-y divide-surface-border">
          {sessions.map((s) => (
            <li key={s.id} className="flex items-center gap-4 px-6 py-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-surface-elevated text-ink-secondary">
                <Globe size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink-primary">{s.agent}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                  {s.loc} · {s.last}
                </p>
              </div>
              {s.current ? (
                <Badge variant="verified" size="sm" dot>
                  Current
                </Badge>
              ) : (
                <button
                  className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted transition-colors hover:text-status-fake"
                  onClick={() => toast('Session revoked')}
                >
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

/* ---------- API Keys ---------- */
interface ApiKey {
  id: string
  label: string
  prefix: string
  created: string
  lastUsed: string
}

function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKey[]>([
    {
      id: '1',
      label: 'Production Server',
      prefix: 'sk_live_a7K2P',
      created: 'Jan 12, 2025',
      lastUsed: '2 minutes ago',
    },
    {
      id: '2',
      label: 'Staging',
      prefix: 'sk_test_82dF1',
      created: 'Dec 04, 2024',
      lastUsed: 'Yesterday',
    },
  ])
  const [creating, setCreating] = useState(false)
  const [newLabel, setNewLabel] = useState('')

  const createKey = () => {
    if (!newLabel.trim()) return
    const id = Date.now().toString()
    setKeys((prev) => [
      {
        id,
        label: newLabel.trim(),
        prefix: `sk_test_${Math.random().toString(36).slice(2, 7)}`,
        created: 'Just now',
        lastUsed: 'Never',
      },
      ...prev,
    ])
    setNewLabel('')
    setCreating(false)
    toast.success('API key created')
  }

  const revoke = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id))
    toast('Key revoked')
  }

  const copy = (k: ApiKey) => {
    navigator.clipboard.writeText(k.prefix + '***')
    toast.success('Key prefix copied')
  }

  return (
    <div className="space-y-6">
      <SectionLabel label="API / Tokens" hint="Programmatic Access" />

      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
          <div>
            <p className="font-display text-base font-bold uppercase tracking-tight text-ink-primary">
              API Keys
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              {keys.length} active
            </p>
          </div>
          <Button
            onClick={() => setCreating(true)}
            leftIcon={<Plus size={16} />}
            size="sm"
          >
            New Key
          </Button>
        </div>

        {creating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-end gap-3 border-b border-surface-border bg-primary/5 px-6 py-4"
          >
            <div className="flex-1">
              <Field
                label="Key Label"
                placeholder="e.g. Production Server"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                autoFocus
              />
            </div>
            <Button onClick={createKey} disabled={!newLabel.trim()} size="sm">
              Generate
            </Button>
            <Button variant="outline" onClick={() => setCreating(false)} size="sm">
              Cancel
            </Button>
          </motion.div>
        )}

        <ul className="divide-y divide-surface-border">
          {keys.map((k) => (
            <li key={k.id} className="flex items-center gap-4 px-6 py-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Key size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink-primary">{k.label}</p>
                <p className="font-mono text-[11px] text-ink-muted">
                  {k.prefix}••••••••••••
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                  Created {k.created}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">
                  Last used {k.lastUsed}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copy(k)}
                className="flex size-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-elevated hover:text-ink-primary"
                aria-label="Copy"
              >
                <Copy size={14} />
              </button>
              <button
                type="button"
                onClick={() => revoke(k.id)}
                className="flex size-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-status-fake-bg hover:text-status-fake"
                aria-label="Revoke"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>

        {keys.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
              No keys yet
            </p>
          </div>
        )}
      </Panel>

      <Panel className="border-status-suspicious/20 bg-status-suspicious-bg/30 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-status-suspicious" />
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-tight text-status-suspicious">
              Keep keys secret
            </p>
            <p className="mt-1 text-xs text-ink-secondary">
              Never commit API keys to source control or share them in client-side code. Treat
              them like passwords — rotate them if they're exposed.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  )
}

/* ---------- Danger Zone ---------- */
function DangerSection() {
  const [confirm, setConfirm] = useState('')
  return (
    <div className="space-y-6">
      <SectionLabel label="Danger Zone / Account" hint="Destructive" />

      <Panel className="border-status-fake/30 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-status-fake" />
          <div className="min-w-0">
            <p className="font-display text-base font-bold uppercase tracking-tight text-status-fake">
              Delete Account
            </p>
            <p className="mt-1 text-sm text-ink-secondary">
              This permanently deletes your account, archives your verification history, and
              cancels any pending top-ups. This action cannot be undone.
            </p>

            <div className="mt-5 max-w-md">
              <Field
                label='Type "DELETE" to confirm'
                placeholder="DELETE"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <div className="mt-5 flex gap-3">
              <Button
                variant="danger"
                disabled={confirm !== 'DELETE'}
                onClick={() => toast.error('Account deletion is disabled in demo mode')}
                leftIcon={<Trash2 size={16} />}
              >
                Delete Account Permanently
              </Button>
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-base font-bold uppercase tracking-tight text-ink-primary">
              Export My Data
            </p>
            <p className="mt-1 text-sm text-ink-secondary">
              Download a JSON archive of your account, verifications, and wallet history.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast.success('Export queued')}>
            Request Export
          </Button>
        </div>
      </Panel>
    </div>
  )
}

/* ---------- Page ---------- */
export default function Settings() {
  const [section, setSection] = useState<Section>('profile')
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-black uppercase tracking-tighter text-ink-primary md:text-4xl">
          Settings
        </h1>
        <p className="mt-2 font-mono text-xs font-bold uppercase tracking-widest text-ink-muted">
          {user?.email || 'Operator'} · <span className="text-primary">Account & Preferences</span>
        </p>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Sidebar nav */}
        <nav className="space-y-2">
          {sections.map((s) => {
            const active = s.id === section
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all',
                  active
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-surface-border bg-surface-card hover:border-primary/20 hover:bg-surface-elevated/40',
                )}
              >
                <span
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-xl',
                    active ? 'bg-primary/15 text-primary' : 'bg-surface-elevated text-ink-muted',
                  )}
                >
                  <s.icon size={18} />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block font-display text-sm font-bold uppercase tracking-tight',
                      active ? 'text-ink-primary' : 'text-ink-secondary',
                    )}
                  >
                    {s.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-ink-muted">{s.description}</span>
                </span>
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="min-w-0"
        >
          {section === 'profile' && <ProfileSection />}
          {section === 'notifications' && <NotificationsSection />}
          {section === 'security' && <SecuritySection />}
          {section === 'api' && <ApiKeysSection />}
          {section === 'danger' && <DangerSection />}
        </motion.div>
      </div>

      <div className="flex items-center justify-center gap-2 border-t border-surface-border pt-6 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
        <SettingsIcon size={12} />
        VerityAI · v1.0.0
      </div>
    </div>
  )
}
