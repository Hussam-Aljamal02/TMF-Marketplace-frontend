'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'
import { format } from 'date-fns'

interface Photo {
  id: number
  title: string | null
  description: string | null
  capture_date: string | null
  has_complete_metadata: boolean
  preview_url?: string | null
  created_at: string
}

export default function UploaderDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) return router.push('/auth/login')
    if (user.role !== 'uploader') return router.push('/buyer/gallery')
    fetchPhotos()
  }, [user, authLoading, router])

  const fetchPhotos = async () => {
    try {
      const response = await api.get('/photos/?my_photos=true')
      setPhotos(response.data.results || response.data || [])
    } catch {
      setError('Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (photoId: number) => {
    if (!confirm('Delete this photo? This cannot be undone.')) return
    setDeleting(photoId)
    try {
      await api.delete(`/photos/${photoId}/`)
      setPhotos(prev => prev.filter(p => p.id !== photoId))
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete photo')
    } finally {
      setDeleting(null)
    }
  }

  const published = photos.filter(p => p.has_complete_metadata).length
  const drafts = photos.filter(p => !p.has_complete_metadata).length

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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Photos</h1>
            <p className="text-slate-600 mt-1">Manage your uploaded photos</p>
          </div>
          <button
            onClick={() => router.push('/uploader/upload')}
            className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition shadow-lg"
          >
            + Upload Photos
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>
        )}

        {drafts > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 text-sm">
              <strong>Add Metadata:</strong> Photos need title, description, and capture date to be visible to buyers.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-3xl font-bold text-slate-900">{photos.length}</div>
            <div className="text-slate-600">Total Photos</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-3xl font-bold text-emerald-600">{published}</div>
            <div className="text-slate-600">Visible to Buyers</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="text-3xl font-bold text-amber-600">{drafts}</div>
            <div className="text-slate-600">Need Metadata</div>
          </div>
        </div>

        {photos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No photos yet</h2>
            <p className="text-slate-600 mb-6">Start uploading photos to share with buyers.</p>
            <button
              onClick={() => router.push('/uploader/upload')}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition shadow-lg"
            >
              Upload Your First Photo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition border border-slate-200 group">
                <div className="relative h-56 bg-slate-100">
                  {photo.preview_url ? (
                    <img
                      src={photo.preview_url}
                      alt={photo.title || 'Photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">Processing...</div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                      photo.has_complete_metadata ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {photo.has_complete_metadata ? 'Visible' : 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-slate-900 mb-1 line-clamp-1">
                    {photo.title || 'Untitled'}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {photo.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span>{photo.capture_date ? format(new Date(photo.capture_date), 'MMM d, yyyy') : 'No date'}</span>
                    <span>Uploaded {format(new Date(photo.created_at), 'MMM d')}</span>
                  </div>
                  <div className="flex gap-2">
                    {!photo.has_complete_metadata ? (
                      <button
                        onClick={() => router.push(`/uploader/photos/${photo.id}/edit`)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition text-sm font-semibold shadow-md"
                      >
                        Add Metadata
                      </button>
                    ) : (
                      <div className="flex-1 px-4 py-2.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium text-center">
                        Visible to Buyers
                      </div>
                    )}
                    <button
                      onClick={() => handleDelete(photo.id)}
                      disabled={deleting === photo.id}
                      className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-medium disabled:opacity-50"
                    >
                      {deleting === photo.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
