'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const isActive = (path: string) => pathname?.startsWith(path)
  const roleLabel = user?.role === 'uploader' ? 'Photographer' : 'Buyer'
  const roleIcon = user?.role === 'uploader' ? 'P' : 'B'
  const roleColors = user?.role === 'uploader' 
    ? 'bg-amber-100 text-amber-600' 
    : 'bg-emerald-100 text-emerald-600'

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                <img src="/images/tmf_logo.png" alt="TMF Logo" className="w-10 h-10" />
              </div>
              <span className="text-xl font-bold text-slate-800 hidden sm:block">Marketplace</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                {user.role === 'uploader' ? (
                  <>
                    <Link
                      href="/uploader/dashboard"
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        isActive('/uploader/dashboard')
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      My Photos
                    </Link>
                    <Link
                      href="/uploader/upload"
                      className={`px-5 py-2 rounded-lg font-semibold transition ${
                        isActive('/uploader/upload')
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-primary-500 text-white hover:bg-primary-600 shadow-md hover:shadow-lg'
                      }`}
                    >
                      + Upload Photos
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/buyer/gallery"
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      isActive('/buyer/gallery')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    Gallery
                  </Link>
                )}

                <div className="h-6 w-px bg-slate-200 mx-2"></div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{user.username}</p>
                    <p className="text-xs text-slate-500">{roleLabel}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold ${roleColors}`}>
                    {roleIcon}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-5 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg hover:from-primary-600 hover:to-primary-700 transition shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 animate-fadeIn">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 px-2 py-3 bg-slate-50 rounded-lg mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-semibold ${roleColors}`}>
                    {roleIcon}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{user.username}</p>
                    <p className="text-sm text-slate-500">{roleLabel}</p>
                  </div>
                </div>

                {user.role === 'uploader' ? (
                  <>
                    <Link
                      href="/uploader/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg font-medium transition ${
                        isActive('/uploader/dashboard')
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      My Photos
                    </Link>
                    <Link
                      href="/uploader/upload"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg font-semibold transition text-center bg-primary-500 text-white hover:bg-primary-600 shadow-md"
                    >
                      + Upload Photos
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/buyer/gallery"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-medium transition ${
                      isActive('/buyer/gallery')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Browse Gallery
                  </Link>
                )}

                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                  className="w-full mt-4 px-4 py-3 text-red-600 font-medium rounded-lg hover:bg-red-50 transition text-left"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-slate-600 font-medium rounded-lg hover:bg-slate-100"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg text-center"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
