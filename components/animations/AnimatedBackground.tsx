import { motion } from 'motion/react';

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Grid Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]">
        <defs>
          <pattern
            id="grid-pattern"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-ink-primary"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>

      {/* Moving Light Lines */}
      <svg className="absolute inset-0 w-full h-full">
        <motion.path
          d="M -100 100 L 500 700"
          stroke="url(#line-gradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1], 
            opacity: [0, 0.5, 0],
            translateX: [0, 1000],
            translateY: [0, 1000]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "linear",
            delay: 0
          }}
        />
        <motion.path
          d="M 1200 100 L 600 800"
          stroke="url(#line-gradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: [0, 1], 
            opacity: [0, 0.4, 0],
            translateX: [-200, -1200],
            translateY: [0, 800]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "linear",
            delay: 2
          }}
        />
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Floating Blobs (SVG Filters) */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Dynamic SVG Shapes */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/10"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            rotate: 0,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            y: ["-10%", "110%"],
            rotate: 360,
          }}
          transition={{ 
            duration: Math.random() * 20 + 20, 
            repeat: Infinity, 
            ease: "linear",
            delay: -Math.random() * 20
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40">
            {i % 2 === 0 ? (
              <rect x="10" y="10" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" />
            ) : (
              <circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            )}
          </svg>
        </motion.div>
      ))}

      {/* SVG Data Bits Falling */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]">
        {[...Array(20)].map((_, i) => (
          <motion.text
            key={i}
            x={Math.random() * 100 + "%"}
            y="-5%"
            fontSize="10"
            fontFamily="monospace"
            className="fill-primary"
            animate={{ y: ["-5%", "105%"] }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 20
            }}
          >
            {Math.random() > 0.5 ? "1" : "0"}
          </motion.text>
        ))}
      </svg>
    </div>
  );
}
