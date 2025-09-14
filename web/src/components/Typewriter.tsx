import { motion, type Variants } from "motion/react"
import { type ElementType, useEffect, useState } from "react"

interface TypewriterProps {
  text: string | string[]
  as?: ElementType
  speed?: number
  initialDelay?: number
  waitTime?: number
  deleteSpeed?: number
  loop?: boolean
  className?: string
  showCursor?: boolean
  hideCursorOnType?: boolean
  cursorChar?: string | React.ReactNode
  cursorClassName?: string
  cursorAnimationVariants?: {
    initial: Variants["initial"]
    animate: Variants["animate"]
  }
}

export default function Typewriter({
  text,
  as: Component = "div",
  speed = 50,
  initialDelay = 0,
  waitTime = 2000,
  deleteSpeed = 30,
  loop = true,
  className = "",
  showCursor = true,
  hideCursorOnType = false,
  cursorChar = "|",
  cursorClassName = "ml-1",
  cursorAnimationVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.01,
        repeat: Infinity,
        repeatDelay: 0.4,
        repeatType: "reverse",
      },
    },
  },
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("")
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const texts = Array.isArray(text) ? text : [text]

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const typeNextChar = () => {
      const currentText = texts[currentTextIndex]
      if (displayText.length < currentText.length) {
        setDisplayText(currentText.slice(0, displayText.length + 1))
        timeout = setTimeout(typeNextChar, speed)
      } else {
        setIsTyping(false)
        if (loop || currentTextIndex < texts.length - 1) {
          timeout = setTimeout(() => setIsDeleting(true), waitTime)
        }
      }
    }

    const deleteChar = () => {
      if (displayText.length > 0) {
        setDisplayText(displayText.slice(0, -1))
        timeout = setTimeout(deleteChar, deleteSpeed)
      } else {
        setIsDeleting(false)
        setCurrentTextIndex((currentTextIndex + 1) % texts.length)
        timeout = setTimeout(() => setIsTyping(true), speed)
      }
    }

    if (!isTyping && !isDeleting) {
      timeout = setTimeout(() => setIsTyping(true), initialDelay)
    } else if (isTyping) {
      timeout = setTimeout(typeNextChar, speed)
    } else if (isDeleting) {
      timeout = setTimeout(deleteChar, deleteSpeed)
    }

    return () => clearTimeout(timeout)
  }, [displayText, currentTextIndex, isTyping, isDeleting, texts, speed, deleteSpeed, waitTime, loop, initialDelay])

  return (
    <Component className={className}>
      {displayText}
      {showCursor && (!hideCursorOnType || !isTyping) && (
        <motion.span
          initial="initial"
          animate="animate"
          variants={cursorAnimationVariants}
          className={cursorClassName}
        >
          {cursorChar}
        </motion.span>
      )}
    </Component>
  )
}
