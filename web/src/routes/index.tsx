import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const elements = headerRef.current?.querySelectorAll('.animate-in')
    if (!elements) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-visible')
            }, index * 150)
          }
        })
      },
      { threshold: 0.1 }
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="light min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-gray-900">
          mcp<sup className="text-lg">3</sup>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button className="text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors">
            Getting Started <span className="text-xs">▾</span>
          </button>
          <button className="text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors">
            Use Cases <span className="text-xs">▾</span>
          </button>
          <button className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</button>
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
          Download <span>→</span>
        </button>
      </nav>

      {/* Hero Section */}
      <header ref={headerRef} className="flex flex-col items-center gap-12 py-16 text-center max-w-4xl mx-auto px-6">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-6xl md:text-8xl font-normal leading-tight">
            <span className="animate-in opacity-0 transform translate-y-5 blur-sm">it's time to</span>
            <br />
            <span className="animate-in opacity-0 transform translate-y-5 blur-sm italic text-orange-400">stress-free</span>{' '}
            <span className="animate-in opacity-0 transform translate-y-5 blur-sm">prep</span>
          </h1>
          
          <p className="animate-in opacity-0 transform translate-y-5 blur-sm text-gray-600 text-lg max-w-md">
            AI that schedules, prepares, and gets<br />
            you ready to ace every interview.
          </p>
          
          <button className="animate-in opacity-0 transform translate-y-5 blur-sm bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
            Try beta <span>→</span>
          </button>
        </div>
        
        {/* Video/Image placeholder */}
        <div className="animate-in opacity-0 transform translate-y-5 blur-sm w-full max-w-4xl h-96 bg-gray-200 rounded-2xl flex items-center justify-center">
          <span className="text-gray-500 text-lg font-medium">main demo video</span>
        </div>
      </header>
    </div>
  )
}
