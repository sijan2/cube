import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer className="mt-auto py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16">
          <div>
            <div className="text-4xl font-bold text-gray-900 poly-regular">
              mcp<sup>3</sup>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed max-w-sm poly-regular mt-2.5">
              AI that schedules, prepares, and gets<br />you ready to ace every interview.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Product</h3>
              <ul className="space-y-3">
                <li><a href="/#features" className="text-gray-600 hover:text-gray-900">Features</a></li>
                <li><a href="/#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a></li>
                <li><Link to="/login" className="text-gray-600 hover:text-gray-900">Beta Access</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Company</h3>
              <ul className="space-y-3">
                <li><a href="/about" className="text-gray-600 hover:text-gray-900">About</a></li>
                <li><a href="/blog" className="text-gray-600 hover:text-gray-900">Blog</a></li>
                <li><a href="/contact" className="text-gray-600 hover:text-gray-900">Contact</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Legal</h3>
              <ul className="space-y-3">
                <li><a href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy</a></li>
                <li><a href="/terms" className="text-gray-600 hover:text-gray-900">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
