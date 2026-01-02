'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === 'uploader' ? '/uploader/dashboard' : '/buyer/gallery')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm font-medium mb-8">
              Premium Stock Photography Platform
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Discover & Share
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-500">
                Stunning Photography
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              TMF Marketplace connects talented photographers with buyers looking for high-quality stock photos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition shadow-lg shadow-primary-500/25"
              >
                Get Started Free
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 bg-white/10 backdrop-blur text-white font-semibold rounded-xl hover:bg-white/20 transition border border-white/10"
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="mt-24 grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition">
              <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center text-2xl font-bold text-amber-400 mb-6">
                P
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">For Photographers</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center gap-3"><span className="text-emerald-400">+</span>Upload single or multiple photos</li>
                <li className="flex items-center gap-3"><span className="text-emerald-400">+</span>Add metadata: title, description, date</li>
                <li className="flex items-center gap-3"><span className="text-emerald-400">+</span>Automatic watermarking for protection</li>
                <li className="flex items-center gap-3"><span className="text-emerald-400">+</span>Manage your portfolio easily</li>
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-2xl font-bold text-emerald-400 mb-6">
                B
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">For Buyers</h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center gap-3"><span className="text-emerald-400">+</span>Browse curated photo gallery</li>
                <li className="flex items-center gap-3"><span className="text-emerald-400">+</span>View complete photo details</li>
                <li className="flex items-center gap-3"><span className="text-emerald-400">+</span>Download watermarked previews</li>
                <li className="flex items-center gap-3"><span className="text-emerald-400">+</span>Get high-quality originals</li>
              </ul>
            </div>
          </div>

          <div className="mt-20 text-center">
            <div className="inline-block bg-gradient-to-r from-primary-500/10 to-primary-500/10 border border-primary-500/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to get started?</h3>
              <p className="text-slate-400 mb-6">Join TMF Marketplace today</p>
              <Link
                href="/auth/register"
                className="inline-block px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition"
              >
                Create Your Account
              </Link>
            </div>
          </div>
        </div>

        <footer className="border-t border-white/10 mt-20 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
            TMF Marketplace - Stock Photography Platform
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
    </div>
  )
}
