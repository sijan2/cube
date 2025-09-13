import { Link } from '@tanstack/react-router'

export function Navbar() {
  return (
    <nav className="w-full bg-gradient-to-b from-[#FF6B00]/40 to-white">
      <div className="flex items-center justify-between p-8 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-gray-900 poly-regular">
          mcp<sup className="text-lg">3</sup>
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
            Login / Signup <span className="transform transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
