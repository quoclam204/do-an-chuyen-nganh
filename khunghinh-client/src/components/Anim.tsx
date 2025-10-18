import { motion } from "framer-motion"

export const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(2px)' },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 22,
      delay: i * 0.06
    }
  })
}

export const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } }
}

export function MotionCard({ i = 0, className = "", children }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={i}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      className={`transform-gpu ${className}`}
    >
      {children}
    </motion.div>
  )
}

export function MotionStagger({ className = "", children }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}