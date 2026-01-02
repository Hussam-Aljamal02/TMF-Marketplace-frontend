'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'
import { format } from 'date-fns'

interface Photo {
  id: number
  uploader_username: string
  title: string
  description: string
  capture_date: string
  preview_url: string | null
  created_at: string
}

export default function BuyerGallery() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [downloading, setDownloading] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) return router.push('/auth/login')
    if (user.role === 'uploader') return router.push('/uploader/dashboard')
    fetchPhotos()
  }, [user, authLoading, router])

  useEffect(() => {
    if (page > 1) loadMorePhotos()
  }, [page])

  const fetchPhotos = async () => {
    try {
      const response = await api.get('/photos/?page=1')
      const data = response.data.results || response.data || []
      setPhotos(data)
      setHasMore(response.data.next !== null && data.length > 0)
    } catch {
      setError('Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  const loadMorePhotos = async () => {
    try {
      const response = await api.get(`/photos/?page=${page}`)
      const newPhotos = response.data.results || response.data || []
      setPhotos(prev => [...prev, ...newPhotos])
      setHasMore(response.data.next !== null && newPhotos.length > 0)
    } catch {}
  }

  const handleDownload = async (photoId: number, type: 'watermarked' | 'hq') => {
    setDownloading(photoId)
    try {
      const response = await api.get(`/photos/${photoId}/download/${type}/`)
      const url = response.data.download_url
      if (url) {
        const link = document.createElement('a')
        link.href = url
        link.download = `photo-${photoId}-${type}.jpg`
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert('Download URL not available')
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Download failed')
    } finally {
      setDownloading(null)
    }
  }

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Photo Gallery</h1>
          <p className="text-slate-600 mt-1">Browse and download high-quality stock photos</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>
        )}

        {photos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No photos available yet</h2>
            <p className="text-slate-600">Photographers are still uploading. Check back later!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-shadow border border-slate-200 group cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <div className="relative h-56 bg-slate-100 overflow-hidden">
                    {photo.preview_url ? (
                      <img src={photo.preview_url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">No preview</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                      <span className="text-white font-medium text-sm">Click to view</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-slate-900 mb-1 line-clamp-1">{photo.title}</h3>
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">{photo.description}</p>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                      <span className="font-medium">By {photo.uploader_username}</span>
                      <span>{format(new Date(photo.capture_date), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(photo.id, 'watermarked') }}
                        disabled={downloading === photo.id}
                        className="px-3 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition text-sm font-medium disabled:opacity-50"
                      >
                        {downloading === photo.id ? '...' : 'Watermarked'}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownload(photo.id, 'hq') }}
                        disabled={downloading === photo.id}
                        className="px-3 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-sm font-medium disabled:opacity-50"
                      >
                        {downloading === photo.id ? '...' : 'HQ'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 text-center">
                <button onClick={() => setPage(p => p + 1)} className="px-8 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition shadow-sm">
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 line-clamp-1">{selectedPhoto.title}</h2>
              <button onClick={() => setSelectedPhoto(null)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition">
                x
              </button>
            </div>

            <div className="p-6">
              <div className="bg-slate-100 rounded-xl overflow-hidden mb-6">
                {selectedPhoto.preview_url ? (
                  <img src={selectedPhoto.preview_url} alt={selectedPhoto.title} className="w-full max-h-[500px] object-contain" />
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-400">No preview</div>
                )}
              </div>

              <div className="mb-6">
                <p className="text-slate-700 text-lg mb-4">{selectedPhoto.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <span>By {selectedPhoto.uploader_username}</span>
                  <span>Captured: {format(new Date(selectedPhoto.capture_date), 'MMMM d, yyyy')}</span>
                  <span>Uploaded: {format(new Date(selectedPhoto.created_at), 'MMMM d, yyyy')}</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handleDownload(selectedPhoto.id, 'watermarked')}
                  disabled={downloading === selectedPhoto.id}
                  className="px-6 py-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Download Watermarked <span className="text-primary-200 text-sm">(Low Quality)</span>
                </button>
                <button
                  onClick={() => handleDownload(selectedPhoto.id, 'hq')}
                  disabled={downloading === selectedPhoto.id}
                  className="px-6 py-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  Download HQ <span className="text-emerald-200 text-sm">(Full Quality)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
