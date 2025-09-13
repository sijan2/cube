import { createFileRoute } from '@tanstack/react-router'
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold">mcp³</div>
        <div className="hidden md:flex items-center gap-8">
          <button className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
            Getting Started <span className="text-xs">▾</span>
          </button>
          <button className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
            Use Cases <span className="text-xs">▾</span>
          </button>
          <button className="text-gray-600 hover:text-gray-900">Pricing</button>
        </div>
        <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
          Download <span>→</span>
        </button>
      </nav>

      {/* Hero Section */}
      <header ref={headerRef} className="flex flex-col items-center gap-12 py-16 text-center max-w-4xl mx-auto px-6">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-6xl md:text-8xl font-normal leading-tight">
            <span className="animate-in opacity-0 transform translate-y-5 blur-sm">welcome to</span>
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
        <div className="animate-in opacity-0 transform translate-y-5 blur-sm w-full max-w-3xl h-80 bg-gray-200 rounded-xl flex items-center justify-center">
          <span className="text-gray-500">Demo Video</span>
        </div>
      </header>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl md:text-6xl font-normal mb-8">
              built for<br />
              <span className="italic text-orange-400">busy people</span>
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">calendar sync</h3>
                <p className="text-sm text-gray-600">works with Google + Outlook.</p>
              </div>
              
              <div className="border-2 border-orange-300 bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">company insights</h3>
                <p className="text-sm text-gray-600">instant research before you meet them.</p>
              </div>
              
              <div className="border-2 border-orange-300 bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">leetcode integration</h3>
                <p className="text-sm text-gray-600">personalized coding prep, scheduled automatically.</p>
              </div>
              
              <div className="border-2 border-orange-300 bg-orange-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900">ai reminders</h3>
                <p className="text-sm text-gray-600">prep sessions timed to keep you sharp, not stressed.</p>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full h-96 bg-gray-200 rounded-xl flex items-end justify-end p-6">
              <div className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                talia
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
