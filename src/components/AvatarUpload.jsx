import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/useAuth'

const MAX_BYTES = 1 * 1024 * 1024 // 1 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

// Hand-written validation: never trust the client, but this is the
// first line of defense that keeps honest users from waiting on a
// slow upload just to get rejected by the server. Returns a message
// string on failure, or null if the file is fine.
function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `"${file.type || 'unknown type'}" isn't a supported image. Use PNG, JPEG, WEBP, or GIF.`
  }
  if (file.size > MAX_BYTES) {
    const mb = (file.size / (1024 * 1024)).toFixed(1)
    return `That file is ${mb} MB - avatars must be 1 MB or smaller.`
  }
  return null
}

export default function AvatarUpload() {
  const { user } = useAuth()
  const fileInputRef = useRef(null)

  const [avatarUrl, setAvatarUrl] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Render the saved avatar on mount.
  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .maybeSingle()

      if (cancelled) return
      if (error) {
        setError(error.message)
      } else {
        setAvatarUrl(data?.avatar_url ?? null)
      }
      setLoadingProfile(false)
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [user.id])

  // Revoke the object URL when we're done with it / component unmounts,
  // so we don't leak memory across repeated selections.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    setError(null)
    if (!file) return

    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      e.target.value = '' // clear the input so the same bad file can be re-picked after fixing it
      setPreviewUrl(null)
      return
    }

    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    // Re-validate at upload time too - the selected file could have
    // changed since the change handler ran, and this is the guard
    // that actually gates the network call.
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    setError(null)

    const ext = file.name.split('.').pop()
    // Fixed filename (not file.name) means re-uploading overwrites the
    // same object instead of accumulating new ones, and upsert: true
    // is what allows that overwrite rather than erroring on conflict.
    const path = `${user.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      setUploading(false)
      setError(uploadError.message)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(path)

    // Cache-bust so the browser doesn't keep showing the old image
    // from its cache after an overwrite at the same path.
    const bustedUrl = `${publicUrl}?t=${Date.now()}`

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, avatar_url: bustedUrl, updated_at: new Date().toISOString() })

    setUploading(false)

    if (profileError) {
      setError(profileError.message)
      return
    }

    setAvatarUrl(bustedUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <section className="border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Profile image
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">Avatar</h2>
        </div>

        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 text-xs text-zinc-500">
        {loadingProfile ? (
            <span>Loading</span>
        ) : previewUrl ? (
            <img src={previewUrl} alt="Selected preview" className="h-full w-full object-cover" />
        ) : avatarUrl ? (
            <img src={avatarUrl} alt="Your avatar" className="h-full w-full object-cover" />
        ) : (
            <span>No avatar</span>
        )}
        </div>
      </div>

      <div className="mt-6 border-t border-zinc-200 pt-5">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          className="block w-full text-sm text-zinc-500 file:mr-4 file:border-0 file:bg-zinc-950 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800"
        />

        {error && (
          <p className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          onClick={handleUpload}
          disabled={!previewUrl || uploading}
          className="mt-4 bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {uploading ? 'Uploading...' : 'Upload avatar'}
        </button>
      </div>
    </section>
  )
}
