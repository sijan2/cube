import { createFileRoute, Link } from '@tanstack/react-router'
import { LoginForm } from "@/components/login-form"

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Login Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-7xl font-normal leading-tight mb-6 poly-regular text-gray-900">
              welcome <span className="poly-regular-italic text-orange-400">back</span>
            </h1>
            <p className="text-gray-600 text-xl">Sign in to continue to your dashboard</p>
          </div>
          <div className="bg-gray-50 p-8 rounded-xl shadow-sm">
            <LoginForm />
          </div>
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/" className="text-orange-400 hover:text-orange-500 font-medium group inline-flex items-center gap-1">
                Sign up <span className="transform transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
