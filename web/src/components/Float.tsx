import { motion } from "motion/react"
import type { ReactNode } from "react"

interface FloatProps {
  children: ReactNode
  speed?: number
  amplitude?: [number, number, number]
  rotationRange?: [number, number, number]
  timeOffset?: number
  className?: string
}

export default function Float({
  children,
  speed = 0.5,
  amplitude = [10, 30, 30],
  rotationRange = [15, 15, 7.5],
  timeOffset = 0,
  className = "",
}: FloatProps) {
  const [moveX, moveY, moveZ] = amplitude
  const [rotateX, rotateY, rotateZ] = rotationRange

  return (
    <motion.div
      className={className}
      animate={{
        y: [0, moveY, 0],
        x: [0, moveX, 0],
        scale: [1, 1 + moveZ / 1000, 1],
        rotateX: [0, rotateX, 0],
        rotateY: [0, rotateY, 0],
        rotateZ: [0, rotateZ, 0],
      }}
      transition={{
        duration: 4 / speed,
        ease: "easeInOut",
        times: [0, 0.5, 1],
        repeat: Infinity,
        delay: timeOffset,
      }}
    >
      {children}
    </motion.div>
  )
}
