'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/Navbar'
import api from '@/lib/api'

interface UploadedPhoto {
  id: number
  preview_url?: string | null
}

export default function UploadPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([])
  const [showMetadataForm, setShowMetadataForm] = useState(false)
  const [metadata, setMetadata] = useState<Record<number, {title: string, description: string, capture_date: string}>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) return router.push('/auth/login')
    if (user.role !== 'uploader') return router.push('/buyer/gallery')
  }, [user, authLoading, router])

  const addFiles = (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'))
    setSelectedFiles(prev => [...prev, ...imageFiles])
    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => setPreviews(prev => [...prev, e.target?.result as string])
      reader.readAsDataURL(file)
    })
    setError('')
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return setError('Select at least one photo')
    setUploading(true)
    setError('')
    setUploadProgress(0)

    try {
      const formData = new FormData()
      selectedFiles.forEach(file => formData.append('images', file))

      const response = await api.post('/photos/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => e.total && setUploadProgress(Math.round((e.loaded * 100) / e.total))
      })

      const photos = response.data.photos || []
      setUploadedPhotos(photos)
      
      const initialMetadata: Record<number, {title: string, description: string, capture_date: string}> = {}
      photos.forEach((p: any) => initialMetadata[p.id] = { title: '', description: '', capture_date: '' })
      setMetadata(initialMetadata)
      
      setSuccess(`Uploaded ${photos.length} photo(s)!`)
      setShowMetadataForm(true)
      setSelectedFiles([])
      setPreviews([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.join(', ') || 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleSaveMetadata = async (photoId: number) => {
    const m = metadata[photoId]
    if (!m.title || !m.description || !m.capture_date) return setError('Fill all metadata fields')

    try {
      await api.patch(`/photos/${photoId}/metadata/`, m)
      setSuccess('Metadata saved! Photo is now visible to buyers.')
      setUploadedPhotos(prev => prev.filter(p => p.id !== photoId))
      if (uploadedPhotos.length === 1) setTimeout(() => router.push('/uploader/dashboard'), 1500)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save metadata')
    }
  }

  const resetForm = () => {
    setShowMetadataForm(false)
    setUploadedPhotos([])
    setSelectedFiles([])
    setPreviews([])
    setSuccess('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (authLoading) {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Upload Photos</h1>
          <p className="text-slate-600 mt-1">Upload single or multiple photos at once</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">{error}</div>
        )}

        {success && !showMetadataForm && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">{success}</div>
        )}

        {showMetadataForm && uploadedPhotos.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add Metadata</h2>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <p className="text-emerald-800 text-sm">
                Fill in all fields and save to make photos visible to buyers.
              </p>
            </div>
            
            <div className="space-y-6">
              {uploadedPhotos.map((photo) => (
                <div key={photo.id} className="p-4 border border-slate-200 rounded-xl">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Preview</label>
                      <div className="bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        {photo.preview_url ? (
                          <img src={photo.preview_url} alt="Preview" className="w-full h-48 object-contain" />
                        ) : (
                          <div className="w-full h-48 flex items-center justify-center text-slate-400">No preview</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
                        <input
                          type="text"
                          value={metadata[photo.id]?.title || ''}
                          onChange={(e) => setMetadata(prev => ({ ...prev, [photo.id]: { ...prev[photo.id], title: e.target.value } }))}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-slate-900"
                          placeholder="Photo title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Capture Date *</label>
                        <input
                          type="date"
                          value={metadata[photo.id]?.capture_date || ''}
                          onChange={(e) => setMetadata(prev => ({ ...prev, [photo.id]: { ...prev[photo.id], capture_date: e.target.value } }))}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                        <textarea
                          value={metadata[photo.id]?.description || ''}
                          onChange={(e) => setMetadata(prev => ({ ...prev, [photo.id]: { ...prev[photo.id], description: e.target.value } }))}
                          rows={3}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-slate-900"
                          placeholder="Describe this photo..."
                        />
                      </div>
                      <button
                        onClick={() => handleSaveMetadata(photo.id)}
                        className="w-full px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium"
                      >
                        Save Metadata
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <p className="text-sm text-slate-600">Photos uploaded. Add metadata later from dashboard.</p>
              <div className="flex gap-3">
                <button onClick={resetForm} className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition font-medium">
                  Upload More
                </button>
                <button onClick={() => router.push('/uploader/dashboard')} className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium">
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(Array.from(e.dataTransfer.files)) }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                isDragging ? 'border-primary-500 bg-primary-50' : 'border-slate-300 hover:border-primary-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
                className="hidden"
              />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {isDragging ? 'Drop photos here!' : 'Drag & drop photos here'}
              </h3>
              <p className="text-slate-600 mb-4">or click to browse</p>
              <p className="text-sm text-slate-500">JPG, PNG, GIF, WebP</p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Selected ({selectedFiles.length})</h3>
                  <button onClick={() => { setSelectedFiles([]); setPreviews([]) }} className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Clear All
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {previews.map((preview, i) => (
                    <div key={i} className="relative group">
                      <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedFiles(prev => prev.filter((_, idx) => idx !== i)); setPreviews(prev => prev.filter((_, idx) => idx !== i)) }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-sm"
                      >
                        x
                      </button>
                      <p className="text-xs text-slate-600 mt-2 truncate">{selectedFiles[i]?.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploading && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Uploading...</span>
                  <span className="text-sm text-slate-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>Uploading...</>
                ) : (
                  <>Upload {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''} Photos</>
                )}
              </button>
              <button onClick={() => router.push('/uploader/dashboard')} className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition">
                Cancel
              </button>
            </div>

            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Add metadata (title, description, capture date) after uploading to make photos visible to buyers.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
