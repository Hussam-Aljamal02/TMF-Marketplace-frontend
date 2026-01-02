'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'

export default function EditPhotoPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const photoId = params.id as string

  const [formData, setFormData] = useState({ title: '', description: '', capture_date: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [photo, setPhoto] = useState<any>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user || user.role !== 'uploader') return router.push('/auth/login')
    fetchPhoto()
  }, [user, authLoading, router, photoId])

  const fetchPhoto = async () => {
    try {
      const response = await api.get(`/photos/${photoId}/`)
      setPhoto(response.data)
      setFormData({
        title: response.data.title || '',
        description: response.data.description || '',
        capture_date: response.data.capture_date || ''
      })
    } catch {
      setError('Failed to load photo')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.title || !formData.description || !formData.capture_date) {
      return setError('All fields required')
    }

    setSaving(true)
    try {
      await api.patch(`/photos/${photoId}/metadata/`, formData)
      setSuccess('Saved! Photo is now visible to buyers.')
      setTimeout(() => router.push('/uploader/dashboard'), 2000)
    } catch (err: any) {
      setError(err.response?.data?.error || Object.values(err.response?.data || {}).flat().join(', ') || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const getImageUrl = () => photo?.watermarked_s3_url || photo?.compressed_s3_url || photo?.original_image || null

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
        </div>
      </div>
    )
  }

  if (!photo) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Photo not found</h2>
            <p className="text-slate-600 mb-6">This photo doesn't exist or you don't have access.</p>
            <button onClick={() => router.push('/uploader/dashboard')} className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button onClick={() => router.push('/uploader/dashboard')} className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 mb-4">
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Add Photo Metadata</h1>
          <p className="text-slate-600 mt-1">Add title, description, and capture date to make visible to buyers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="bg-slate-100 p-6 flex items-center justify-center min-h-[300px]">
              {getImageUrl() ? (
                <img src={getImageUrl()!} alt={photo.title || 'Photo'} className="max-w-full max-h-[400px] rounded-lg shadow-lg object-contain" />
              ) : (
                <div className="text-center text-slate-400">Preview not available</div>
              )}
            </div>

            <div className="p-6">
              {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>}
              {success && <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm">{success}</div>}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900"
                    placeholder="Photo title"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900"
                    placeholder="Describe the photo..."
                  />
                </div>

                <div>
                  <label htmlFor="capture_date" className="block text-sm font-semibold text-slate-700 mb-2">Capture Date *</label>
                  <input
                    id="capture_date"
                    type="date"
                    value={formData.capture_date}
                    onChange={(e) => setFormData({ ...formData, capture_date: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-6 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>Saving...</> : 'Save Metadata'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-sm text-emerald-800">
                  <strong>Automatic Visibility:</strong> Complete all fields and save to make your photo visible to buyers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
