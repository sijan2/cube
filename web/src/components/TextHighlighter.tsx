import { cn } from "@/lib/utils"
import { motion } from "motion/react"
import type { HTMLMotionProps } from "motion/react"

interface TextHighlighterProps extends HTMLMotionProps<"span"> {
  children: React.ReactNode
  highlightColor?: string
  direction?: "ltr" | "rtl" | "ttb" | "btt"
  useInViewOptions?: { once?: boolean; amount?: number }
}

export function TextHighlighter({
  children,
  className,
  highlightColor = "rgba(255, 118, 40, 0.1)",
  direction = "ltr",
  transition = { type: "spring", duration: 0.8, delay: 0, bounce: 0 },
  useInViewOptions = { once: true, amount: 0.1 },
  ...props
}: TextHighlighterProps) {
  const getBackgroundSize = (animated: boolean) => {
    switch (direction) {
      case "ltr":
        return animated ? "100% 100%" : "0% 100%"
      case "rtl":
        return animated ? "100% 100%" : "0% 100%"
      case "ttb":
        return animated ? "100% 100%" : "100% 0%"
      case "btt":
        return animated ? "100% 100%" : "100% 0%"
      default:
        return animated ? "100% 100%" : "0% 100%"
    }
  }

  const getBackgroundPosition = () => {
    switch (direction) {
      case "ltr":
        return "0% 0%"
      case "rtl":
        return "100% 0%"
      case "ttb":
        return "0% 0%"
      case "btt":
        return "0% 100%"
      default:
        return "0% 0%"
    }
  }

  const initialSize = getBackgroundSize(false)
  const animatedSize = getBackgroundSize(true)
  const backgroundPosition = getBackgroundPosition()

  const highlightStyle = {
    backgroundImage: `linear-gradient(${highlightColor}, ${highlightColor})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: backgroundPosition,
    backgroundSize: animatedSize,
    boxDecorationBreak: "clone",
    WebkitBoxDecorationBreak: "clone",
  } as React.CSSProperties

  return (
    <motion.span
      className={cn("inline", className)}
      style={highlightStyle}
      animate={{
        backgroundSize: animatedSize,
      }}
      initial={{
        backgroundSize: initialSize,
      }}
      transition={transition}
      {...props}
    >
      {children}
    </motion.span>
  )
}
