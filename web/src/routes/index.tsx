import { createFileRoute, Link } from '@tanstack/react-router'
import { useRef, useState, useEffect } from 'react'
import { TextHighlighter } from '../components/TextHighlighter'
import GradualBlur from '../components/GradualBlur'
import Typewriter from 'typewriter-effect'
import StarBorder from '../components/StarBorder'
import PixelTrail from '../components/fancy/background/pixel-trail'

function App() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set())
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)
  
  const headerRef = useRef<HTMLElement>(null)
  const featuresRef = useRef<HTMLElement>(null)
  const chaosRef = useRef<HTMLElement>(null)
  const glanceRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target.getAttribute('data-section')
          if (section) {
            setVisibleSections((prev) => {
              const next = new Set(prev)
              if (entry.isIntersecting) {
                next.add(section)
              } else {
                next.delete(section)
              }
              return next
            })
          }
        })
      },
      { threshold: 0.1 }
    )

    const sections = document.querySelectorAll('[data-section]')
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-white relative">
      <div className="relative flex flex-col min-h-screen">
        {/* PixelTrail background overlay */}
        <PixelTrail
          pixelSize={20}
          fadeDuration={600}
          className="pointer-events-none"
          pixelClassName="bg-orange-500/20"
        />
        <header className="relative z-10">
          <nav className="w-full bg-gradient-to-b from-[#FF6B00]/40 to-white">
            <div className="flex items-center justify-between p-8 max-w-7xl mx-auto">
            <div className="text-2xl font-bold text-gray-900 poly-regular">
              mcp<sup className="text-lg">2</sup>
            </div>
            <div className="hidden md:flex items-center gap-12 absolute left-1/2 -translate-x-1/2">
              <button className="text-gray-900/80 hover:text-gray-900 flex items-center gap-1 transition-all group">
                Getting Started <span className="text-xs transition-transform duration-200 group-hover:translate-y-0.5">▾</span>
              </button>
              <button className="text-gray-900/80 hover:text-gray-900 flex items-center gap-1 transition-all group">
                Use Cases <span className="text-xs transition-transform duration-200 group-hover:translate-y-0.5">▾</span>
              </button>
              <button className="text-gray-600 hover:text-gray-900 transition-all group flex items-center gap-1">
                Pricing <span className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">→</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="bg-gray-900/90 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-all flex items-center gap-2 group">
                Login <span className="transform transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </div>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section 
          ref={headerRef}
          data-section="hero"
          className={`flex flex-col items-center gap-6 py-16 text-center max-w-7xl mx-auto px-6 relative mt-2 transition-all duration-1000 ${visibleSections.has('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
        >
          <div className="relative z-10">
            <div className="flex flex-col items-center gap-0">
              <h1 className="text-8xl md:text-9xl font-normal leading-tight poly-regular">
                <div className="text-gray-900">it&apos;s time to</div>
                <div className="flex items-center gap-4 -mt-4">
                  <span className="poly-regular-italic text-orange-400">
                    <Typewriter
                      options={{
                        strings: ['stress-free'],
                        autoStart: true,
                        loop: false,
                        cursor: '',
                        delay: 70,
                        deleteSpeed: 999999999
                      }}
                    />
                  </span>
                  <span className="text-gray-900">prep</span>
                </div>
              </h1>
              
              <div className="space-y-6 flex flex-col items-center w-full max-w-xl mx-auto">
                <p className="text-gray-600 text-2xl max-w-xl mt-4">
                  AI that <TextHighlighter direction="ltr">schedules</TextHighlighter> and <TextHighlighter direction="ltr">prepares</TextHighlighter> you to <TextHighlighter direction="ltr">ace every interview</TextHighlighter>.
                </p>
                
                <Link to="/login" className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-all text-xl group">
                  Try beta <span className="transform transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
            
            {/* Video/Image placeholder */}
            <StarBorder color="#FF6B00" speed="8s" className="w-full max-w-[90rem] mt-24 overflow-hidden">
              <div className="w-full aspect-video">
                <iframe
                  src="https://drive.google.com/file/d/1zICcVqgyGP_gBaEjjAdBbhK3H38T8rOq/preview"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </StarBorder>
          </div>
        </section>

        {/* Features Section */}
        <section 
          ref={featuresRef}
          data-section="features" 
          className={`relative flex flex-row items-start justify-center gap-16 py-72 mx-auto px-6 transition-all duration-1000 ${visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
        >
          <div className="w-[400px] pl-8 flex-shrink-0">
            <h2 className="text-7xl font-normal leading-tight mb-12 poly-regular">
              <div className="text-gray-900">built for</div>
              <div className="-mt-4">
                <span className="poly-regular-italic text-orange-400 hover:text-orange-500 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">busy people</span>
              </div>
            </h2>
            <p className="text-gray-600 text-base mb-4">
              Everything you need to <TextHighlighter direction="ltr">prepare effectively</TextHighlighter> and <TextHighlighter direction="ltr">stay organized</TextHighlighter>.
            </p>

            <div className="grid grid-cols-1 gap-2">
              <div 
                className="calendar-sync-card bg-gray-100 rounded-lg p-3 group hover:bg-orange-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredFeature('calendar')}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <h3 className="text-base font-medium text-gray-900 mb-1">Calendar Sync</h3>
                <p className="text-gray-600 text-sm">
                  works with Google + Outlook.
                </p>
              </div>

              <div 
                className="company-insights-card bg-gray-100 rounded-lg p-3 group hover:bg-orange-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredFeature('insights')}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <h3 className="text-base font-medium text-gray-900 mb-1">Company Insights</h3>
                <p className="text-gray-600 text-sm">
                  instant research before you meet them.
                </p>
              </div>

              <div 
                className="leetcode-card bg-gray-100 rounded-lg p-3 group hover:bg-orange-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredFeature('leetcode')}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <h3 className="text-base font-medium text-gray-900 mb-1">Leetcode Integration</h3>
                <p className="text-gray-600 text-sm">
                  personalized coding prep, scheduled automatically.
                </p>
              </div>

              <div 
                className="ai-reminders-card bg-gray-100 rounded-lg p-3 group hover:bg-orange-50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredFeature('reminders')}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <h3 className="text-base font-medium text-gray-900 mb-1">AI Reminders</h3>
                <p className="text-gray-600 text-sm">
                  prep sessions timed to keep you sharp, not stressed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 relative min-w-0 pr-8 ml-16">
            <div className="w-full h-[24rem] rounded-xl flex items-center justify-center sticky top-48 overflow-hidden mt-24">
              <img src="/featuredemo.png" alt="Feature Demo" className="w-full h-full object-cover" />
              
              {/* Calendar Sync Highlight */}
              <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${hoveredFeature === 'calendar' ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[45%] h-[55%] border-2 border-orange-500 rounded-lg" />
              </div>
              
              {/* Company Insights Highlight */}
              <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${hoveredFeature === 'insights' ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute top-0 right-0 bottom-0 w-[25%] border-2 border-orange-500 rounded-lg" />
              </div>
              
              {/* Leetcode Integration Highlight */}
              <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${hoveredFeature === 'leetcode' ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute top-0 left-0 bottom-0 w-[25%] border-2 border-orange-500 rounded-lg" />
              </div>
              
              {/* AI Reminders Highlight */}
              <div className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${hoveredFeature === 'reminders' ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[45%] h-[55%] border-2 border-orange-500 rounded-lg" />
              </div>
            </div>
          </div>
        </section>

        {/* Less Chaos Section */}
        <section 
          ref={chaosRef}
          data-section="chaos"
          className={`relative flex flex-col items-center py-72 text-center max-w-4xl mx-auto px-6 overflow-hidden transition-all duration-1000 ${visibleSections.has('chaos') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
        >
          <GradualBlur target="parent" position="top" height="10rem" strength={2} divCount={5} curve="bezier" exponential={true} opacity={1} />
          <h2 className="text-7xl font-normal leading-tight mb-12 poly-regular">
            <span className="text-gray-900">less chaos,</span>
            <br />
            <span className="poly-regular-italic text-orange-400">more confidence</span>
          </h2>

          <div className="space-y-6">
            <p className="text-gray-600 text-2xl leading-relaxed max-w-2xl mx-auto">
              Most people waste hours <TextHighlighter direction="ltr">juggling calendars</TextHighlighter>, <TextHighlighter direction="ltr">digging through emails</TextHighlighter>, and <TextHighlighter direction="ltr">cramming prep</TextHighlighter>.
            </p>
            <p className="text-gray-600 text-2xl leading-relaxed mt-4 max-w-2xl mx-auto">
              <TextHighlighter direction="ltr">MCP</TextHighlighter><sup>2</sup> gives you <TextHighlighter direction="ltr">clarity</TextHighlighter>, <TextHighlighter direction="ltr">structure</TextHighlighter>, and <TextHighlighter direction="ltr">focus</TextHighlighter>, without the stress.
            </p>
          </div>
        </section>

        {/* At a Glance Section */}
        <section 
          ref={glanceRef} 
          data-section="glance"
          className={`relative flex flex-col items-center py-48 text-center overflow-hidden transition-all duration-1000 ${
            visibleSections.has('glance') 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-20'
          }`}
        >
          <GradualBlur target="parent" position="top" height="10rem" strength={2} divCount={5} curve="bezier" exponential={true} opacity={1} />
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-7xl font-normal leading-tight mb-12 poly-regular">
              <span className="text-gray-900">your prep,</span>{' '}
              <span className="poly-regular-italic text-orange-400">at a glance</span>
            </h2>

            <p className="text-gray-600 text-2xl leading-relaxed mb-16 max-w-2xl mx-auto">
              See your <TextHighlighter direction="ltr">upcoming interviews</TextHighlighter>, <TextHighlighter direction="ltr">prep tasks</TextHighlighter>, and <TextHighlighter direction="ltr">AI-generated questions</TextHighlighter> in one clean view.
            </p>

            <StarBorder color="#FF6B00" speed="8s" className="w-full max-w-[90rem] h-[22rem] overflow-hidden">
              <div className="w-full h-full">
                <img src="/featuredemo.png" alt="Feature Demo" className="w-full h-full object-cover" />
              </div>
            </StarBorder>
          </div>
        </section>

        {/* Start Today Section */}
        <section 
          data-section="start"
          className={`flex flex-col items-center py-72 text-center max-w-4xl mx-auto px-6 transition-all duration-1000 ${visibleSections.has('start') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
        >
          <h2 className="text-7xl font-normal leading-tight mb-12 poly-regular">
            <span className="text-gray-900">start</span>{' '}
            <span className="poly-regular-italic text-orange-400">today</span>
          </h2>
          <p className="text-gray-600 text-xl mb-12 max-w-xl">
            Join the <TextHighlighter direction="ltr">beta</TextHighlighter> and get <TextHighlighter direction="ltr">unlimited access</TextHighlighter>, free forever.
          </p>
          <div className="flex gap-4 mt-8">
            <Link to="/login" className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-all text-lg group">
              Sign up <span className="transform transition-transform duration-200 group-hover:translate-x-1 inline-block">→</span>
            </Link>
            <Link to="/login" className="bg-white text-gray-900 px-6 py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all text-lg group">
              Log in <span className="transform transition-transform duration-200 group-hover:translate-x-1 inline-block">→</span>
            </Link>
          </div>
        </section>

        <footer className="mt-auto py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-16">
              <div>
                <div className="text-4xl font-bold text-gray-900 poly-regular">
                  mcp<sup>2</sup>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed max-w-sm poly-regular mt-2">
                  AI that schedules, prepares, and gets<br />you ready to ace every interview.
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Product</h3>
                  <ul className="space-y-3">
                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Features</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Pricing</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Beta Access</a></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Company</h3>
                  <ul className="space-y-3">
                    <li><a href="#" className="text-gray-600 hover:text-gray-900">About</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Blog</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact</a></li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900">Legal</h3>
                  <ul className="space-y-3">
                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacy</a></li>
                    <li><a href="#" className="text-gray-600 hover:text-gray-900">Terms</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: App,
})