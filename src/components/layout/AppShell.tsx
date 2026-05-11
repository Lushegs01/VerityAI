import { motion } from 'framer-motion'
import { useState } from 'react'
import { useLocation } from 'react-router'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import DemoBanner from './DemoBanner'
import MobileTabBar from './MobileTabBar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-surface-base">
      <DemoBanner />
      <div className="flex">
        <Sidebar
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onMenuClick={() => setMobileNavOpen(true)} />
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-10"
          >
            {children}
          </motion.main>
        </div>
      </div>
      <MobileTabBar />
    </div>
  )
}
