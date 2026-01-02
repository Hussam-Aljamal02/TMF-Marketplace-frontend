'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', password2: '',
    role: '' as 'uploader' | 'buyer' | '', first_name: '', last_name: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user) {
      router.push(user.role === 'uploader' ? '/uploader/dashboard' : '/buyer/gallery')
    }
  }, [user, authLoading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.role) return setError('Select a role')
    if (formData.password !== formData.password2) return setError('Passwords do not match')
    if (formData.password.length < 8) return setError('Password must be at least 8 characters')

    setLoading(true)
    try {
      await register(formData as any)
      setTimeout(() => router.push(formData.role === 'uploader' ? '/uploader/dashboard' : '/buyer/gallery'), 100)
    } catch (err: any) {
      const data = err.response?.data
      if (data?.error) setError(data.error)
      else if (data) setError(Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('. '))
      else setError('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50 to-slate-100">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white text-2xl font-bold">TMF</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Join TMF Marketplace</h1>
              <p className="text-slate-600">Create your account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">I want to be a... *</label>
                <div className="grid grid-cols-2 gap-4">
                  {(['uploader', 'buyer'] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role })}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.role === role
                          ? role === 'uploader' ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200' : 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`text-2xl mb-2 font-bold ${role === 'uploader' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {role === 'uploader' ? 'P' : 'B'}
                      </div>
                      <div className="font-semibold text-slate-900">{role === 'uploader' ? 'Uploader' : 'Buyer'}</div>
                      <div className="text-xs text-slate-500 mt-1">{role === 'uploader' ? 'Upload & sell photos' : 'Browse & download'}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                  <input id="first_name" name="first_name" type="text" value={formData.first_name} onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900" placeholder="John" />
                </div>
                <div>
                  <label htmlFor="last_name" className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                  <input id="last_name" name="last_name" type="text" value={formData.last_name} onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">Username *</label>
                <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900" placeholder="johndoe" />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">Email *</label>
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900" placeholder="john@example.com" />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">Password *</label>
                <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required minLength={8}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900" placeholder="At least 8 characters" />
              </div>

              <div>
                <label htmlFor="password2" className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password *</label>
                <input id="password2" name="password2" type="password" value={formData.password2} onChange={handleChange} required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900" placeholder="Confirm password" />
              </div>

              <button
                type="submit"
                disabled={loading || !formData.role}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3.5 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>Creating...</> : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-600">
                Already have an account? <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
