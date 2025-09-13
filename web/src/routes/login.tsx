import { createFileRoute, Link } from '@tanstack/react-router'
import { LoginForm } from "@/components/login-form"

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <Link to="/" className="text-2xl font-bold">Cube</Link>
        <div className="hidden md:flex items-center gap-8">
          <button className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
            Getting Started <span className="text-xs">▾</span>
          </button>
          <button className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
            Use Cases <span className="text-xs">▾</span>
          </button>
          <button className="text-gray-600 hover:text-gray-900">Pricing</button>
        </div>
      </nav>

      {/* Login Section */}
      <div className="flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-normal mb-4">
              welcome <span className="italic text-orange-400">back</span>
            </h1>
            <p className="text-gray-600">Sign in to continue to your dashboard</p>
          </div>
          <div className="bg-gray-50 p-8 rounded-xl">
            <LoginForm />
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/" className="text-orange-400 hover:text-orange-500 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
