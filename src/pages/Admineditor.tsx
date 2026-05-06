import {
  useReducer, useEffect, useRef, useCallback, useState,
} from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useEditor, EditorContent, type Editor,
} from '@tiptap/react'
import StarterKit           from '@tiptap/starter-kit'
import ImageExtension       from '@tiptap/extension-image'
import LinkExtension        from '@tiptap/extension-link'
import ListItem             from '@tiptap/extension-list-item'
import Placeholder          from '@tiptap/extension-placeholder'
import CharacterCount       from '@tiptap/extension-character-count'
import Underline            from '@tiptap/extension-underline'

import {
  Bold, Italic, UnderlineIcon, Heading2, Heading3,
  Quote, List, ListOrdered, Link as LinkIcon,
  ImageIcon, Minus, Undo, Redo, Lock, Unlock,
  ChevronDown, ChevronUp, Upload, X, Save,
  Globe, AlertTriangle, Loader2, Eye, Trash2,
  ArrowLeft, Zap, Star, RefreshCw, ShieldAlert, CheckCircle2,
  Move,
} from 'lucide-react'

import { client }  from '../api/client'
import { useAuth } from '../context/AuthContext'

// ── Types ─────────────────────────────────────────────────────

interface Category { id: string; name: string; slug: string; color: string }

interface ArticleForm {
  title:            string
  subtitle:         string
  slug:             string
  body:             string
  excerpt:          string
  category_id:      string
  cover_image:      string
  cover_position:   string   // ← NEW: e.g. "50% 30%" for object-position
  status:           'draft' | 'published' | 'archived'
  is_featured:      boolean
  is_breaking:      boolean
  meta_title:       string
  meta_description: string
  tag_ids:          string[]
}

type Action =
  | { type: 'SET_FIELD'; field: keyof ArticleForm; value: any }
  | { type: 'LOAD'; payload: Partial<ArticleForm> }
  | { type: 'RESET_DIRTY' }

interface State {
  form:  ArticleForm
  dirty: boolean
}

// ── Slug helper ───────────────────────────────────────────────

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── Reducer ───────────────────────────────────────────────────

const INITIAL_FORM: ArticleForm = {
  title: '', subtitle: '', slug: '', body: '', excerpt: '',
  category_id: '', cover_image: '', cover_position: '50% 50%',
  status: 'draft', is_featured: false, is_breaking: false,
  meta_title: '', meta_description: '', tag_ids: [],
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_FIELD':
      return { form: { ...state.form, [action.field]: action.value }, dirty: true }
    case 'LOAD':
      return { form: { ...INITIAL_FORM, ...action.payload }, dirty: false }
    case 'RESET_DIRTY':
      return { ...state, dirty: false }
    default:
      return state
  }
}

// ── Toolbar button ─────────────────────────────────────────────

function ToolBtn({
  onClick, active = false, disabled = false, title, children,
}: {
  onClick:   () => void
  active?:   boolean
  disabled?: boolean
  title:     string
  children:  React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="p-1.5 rounded-lg transition-all disabled:opacity-30"
      style={{
        background: active ? 'var(--accent-light)' : 'transparent',
        color:      active ? 'var(--accent)'        : 'var(--text-secondary)',
      }}
      onMouseEnter={e => {
        if (!active && !disabled)
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-subtle)'
      }}
      onMouseLeave={e => {
        if (!active)
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
      }}
    >
      {children}
    </button>
  )
}

// ── Tiptap toolbar ─────────────────────────────────────────────

function Toolbar({
  editor,
  onImageUpload,
  imageUploading,
}: {
  editor:         Editor
  onImageUpload:  (file: File) => Promise<void>
  imageUploading: boolean
}) {
  // Hidden file input for toolbar image picker
  const imgInputRef = useRef<HTMLInputElement>(null)

  const setLink = () => {
    const prev = editor.getAttributes('link').href ?? ''
    const url  = window.prompt('Enter URL', prev)
    if (url === null) return
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const sep = (
    <span
      className="w-px h-5 mx-0.5 flex-shrink-0"
      style={{ background: 'var(--border)' }}
    />
  )

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 px-3 py-2 rounded-xl mb-3"
      style={{
        background: 'var(--bg-subtle)',
        border:     '1px solid var(--border)',
        position:   'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <ToolBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo size={14} /></ToolBtn>
      {sep}
      <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()}      active={editor.isActive('bold')}      title="Bold"><Bold size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()}    active={editor.isActive('italic')}    title="Italic"><Italic size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline"><UnderlineIcon size={14} /></ToolBtn>
      {sep}
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 size={14} /></ToolBtn>
      {sep}
      <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()}  active={editor.isActive('blockquote')}  title="Blockquote"><Quote size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()}  active={editor.isActive('bulletList')}  title="Bullet list"><List size={14} /></ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list"><ListOrdered size={14} /></ToolBtn>
      {sep}
      <ToolBtn onClick={setLink}  active={editor.isActive('link')} title="Link"><LinkIcon size={14} /></ToolBtn>

      {/* ── Inline image upload via Cloudinary ── */}
      <ToolBtn
        onClick={() => !imageUploading && imgInputRef.current?.click()}
        disabled={imageUploading}
        title={imageUploading ? 'Uploading image…' : 'Upload image to article'}
      >
        {imageUploading
          ? <Loader2 size={14} className="animate-spin" />
          : <ImageIcon size={14} />
        }
      </ToolBtn>

      <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule"><Minus size={14} /></ToolBtn>

      {/* Hidden file input */}
      <input
        ref={imgInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={async e => {
          const f = e.target.files?.[0]
          if (f) await onImageUpload(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}

// ── Cover position presets ─────────────────────────────────────

const POSITION_PRESETS = [
  { label: 'Top Left',    value: '0% 0%',    title: '↖' },
  { label: 'Top Center',  value: '50% 0%',   title: '↑' },
  { label: 'Top Right',   value: '100% 0%',  title: '↗' },
  { label: 'Center',      value: '50% 50%',  title: '⊕' },
  { label: 'Bottom Left', value: '0% 100%',  title: '↙' },
  { label: 'Bottom Ctr',  value: '50% 100%', title: '↓' },
  { label: 'Bottom Right',value: '100% 100%',title: '↘' },
] as const

// ── Cover Position Picker ─────────────────────────────────────
// Drag-to-reposition focal point picker + quick preset buttons.

function CoverPositionPicker({
  imageUrl,
  position,
  onChange,
}: {
  imageUrl: string
  position: string
  onChange: (pos: string) => void
}) {
  const padRef    = useRef<HTMLDivElement>(null)
  const dragging  = useRef(false)

  // Parse current position percentages
  const [px, py] = position.split(' ').map(v => parseFloat(v))

  const computePos = (clientX: number, clientY: number) => {
    const rect = padRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width)  * 100))
    const y = Math.max(0, Math.min(100, ((clientY - rect.top)  / rect.height) * 100))
    onChange(`${Math.round(x)}% ${Math.round(y)}%`)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true
    computePos(e.clientX, e.clientY)
    e.preventDefault()
  }
  const onMouseMove = (e: React.MouseEvent) => {
    if (dragging.current) computePos(e.clientX, e.clientY)
  }
  const onMouseUp = () => { dragging.current = false }

  // Touch support
  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true
    computePos(e.touches[0].clientX, e.touches[0].clientY)
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragging.current) computePos(e.touches[0].clientX, e.touches[0].clientY)
  }
  const onTouchEnd = () => { dragging.current = false }

  return (
    <div className="mt-3 space-y-3">
      {/* Label */}
      <div className="flex items-center gap-1.5">
        <Move size={11} style={{ color: 'var(--text-muted)' }} />
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Focal Point
        </span>
        <span className="text-[10px] ml-auto font-mono" style={{ color: 'var(--text-muted)' }}>
          {position}
        </span>
      </div>

      {/* Drag pad — shows a thumbnail of the image with a crosshair */}
      <div
        ref={padRef}
        className="relative rounded-xl overflow-hidden cursor-crosshair select-none"
        style={{ height: 120, border: '1px solid var(--border)' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Full cover preview at chosen object-position */}
        <img
          src={imageUrl}
          alt="Cover focal point"
          draggable={false}
          style={{
            width:          '100%',
            height:         '100%',
            objectFit:      'cover',
            objectPosition: position,
            pointerEvents:  'none',
            userSelect:     'none',
          }}
        />

        {/* Dim overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.18)' }}
        />

        {/* Crosshair dot */}
        <div
          className="absolute w-5 h-5 rounded-full border-2 border-white shadow-lg"
          style={{
            left:       `${px}%`,
            top:        `${py}%`,
            transform:  'translate(-50%, -50%)',
            background: 'rgba(255,255,255,0.25)',
            pointerEvents: 'none',
            transition: dragging.current ? 'none' : 'left 0.08s, top 0.08s',
          }}
        />

        {/* Helper text */}
        <div
          className="absolute bottom-2 left-0 right-0 flex justify-center"
          style={{ pointerEvents: 'none' }}
        >
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
          >
            Drag to set focal point
          </span>
        </div>
      </div>

      {/* Quick preset buttons — 4 cols */}
      <div className="grid grid-cols-4 gap-1.5">
        {POSITION_PRESETS.map(p => {
          const active = position === p.value
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange(p.value)}
              title={p.label}
              className="py-1.5 rounded-lg text-sm font-bold transition-all"
              style={{
                background: active ? 'var(--accent)' : 'var(--bg)',
                color:      active ? '#fff'           : 'var(--text-muted)',
                border:     `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              {p.title}
            </button>
          )
        })}
      </div>

      {/* Live frontend preview strip */}
      <div>
        <p className="text-[10px] mb-1.5 font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Frontend Preview
        </p>
        <div
          className="rounded-xl overflow-hidden"
          style={{ height: 80, border: '1px solid var(--border)' }}
        >
          <img
            src={imageUrl}
            alt="Frontend preview"
            style={{
              width:          '100%',
              height:         '100%',
              objectFit:      'cover',
              objectPosition: position,
            }}
          />
        </div>
        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
          This is exactly how the cover will appear cropped on article cards.
        </p>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────

export default function AdminEditor() {
  const { id }   = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const isNew = !id || id === 'new'

  const isEditorPlus = user?.role === 'editor' || user?.role === 'super_admin'
  const canDelete    = !isNew

  const [state, dispatch] = useReducer(reducer, { form: INITIAL_FORM, dirty: false })
  const { form, dirty }   = state

  const [loadingArticle, setLoadingArticle] = useState(!isNew)
  const [loadError,      setLoadError]      = useState('')
  const [saving,         setSaving]         = useState(false)
  const [saveStatus,     setSaveStatus]     = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError,      setSaveError]      = useState('')

  const [categories,     setCategories]     = useState<Category[]>([])
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverError,     setCoverError]     = useState('')

  // ── NEW: inline image upload state ──────────────────────────
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError,     setImageError]     = useState('')

  const [slugLocked,  setSlugLocked]  = useState(!isNew)
  const [seoOpen,     setSeoOpen]     = useState(false)
  const [dangerOpen,  setDangerOpen]  = useState(false)
  const [deleting,    setDeleting]    = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [dragOver,    setDragOver]    = useState(false)

  // ── NEW: editor body drag-over state ────────────────────────
  const [editorDragOver, setEditorDragOver] = useState(false)

  const coverInputRef = useRef<HTMLInputElement>(null)

  const articleId    = useRef<string | null>(isNew ? null : (id ?? null))
  const saveInFlight = useRef(false)
  const formRef      = useRef<ArticleForm>(form)
  const dirtyRef     = useRef(dirty)

  useEffect(() => { formRef.current  = form  }, [form])
  useEffect(() => { dirtyRef.current = dirty }, [dirty])

  // ── Unsaved-changes guard ─────────────────────────────────

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  const safeNavigate = useCallback((to: string, opts?: { replace?: boolean }) => {
    if (dirtyRef.current && !window.confirm('You have unsaved changes. Leave anyway?')) return
    navigate(to, opts)
  }, [navigate])

  // ── Tiptap editor ─────────────────────────────────────────

  const editor = useEditor({
    extensions: [
      StarterKit,
      ListItem,
      Underline,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Start writing your article…' }),
      CharacterCount,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      dispatch({ type: 'SET_FIELD', field: 'body', value: editor.getHTML() })
    },
  })

  // ── Load categories ───────────────────────────────────────

  useEffect(() => {
    client.get('/categories')
      .then(r => setCategories(r.data?.data ?? []))
      .catch(() => {})
  }, [])

  // ── Load existing article ─────────────────────────────────

  useEffect(() => {
    if (isNew) return

    setLoadingArticle(true)
    client.get(`/articles/admin/${id}`)
      .then(r => {
        const a = r.data?.data ?? r.data
        dispatch({
          type: 'LOAD',
          payload: {
            title:            a.title            ?? '',
            subtitle:         a.subtitle         ?? '',
            slug:             a.slug             ?? '',
            body:             a.body             ?? '',
            excerpt:          a.excerpt          ?? '',
            category_id:      a.category_id      ?? '',
            cover_image:      a.cover_image      ?? '',
            cover_position:   a.cover_position   ?? '50% 50%',  // ← NEW
            status:           a.status           ?? 'draft',
            is_featured:      a.is_featured      ?? false,
            is_breaking:      a.is_breaking      ?? false,
            meta_title:       a.meta_title       ?? '',
            meta_description: a.meta_description ?? '',
            tag_ids:          a.tag_ids          ?? [],
          },
        })
        editor?.commands.setContent(a.body ?? '')
      })
      .catch(e => {
        const msg = e?.response?.data?.message ?? 'Failed to load article.'
        setLoadError(
          e?.response?.status === 403
            ? 'You don\'t have permission to edit this article.'
            : msg
        )
      })
      .finally(() => setLoadingArticle(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew])

  // Sync body to editor once on initial load
  const bodyInitialised = useRef(false)
  useEffect(() => {
    if (bodyInitialised.current) return
    if (form.body && editor) {
      editor.commands.setContent(form.body)
      bodyInitialised.current = true
    }
  }, [form.body, editor])

  // ── localStorage draft ────────────────────────────────────

  const lsKey = `mpn_draft_${isNew ? 'new' : (id ?? 'new')}`
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [localDraft,      setLocalDraft]      = useState<ArticleForm | null>(null)

  useEffect(() => {
    if (!isNew) return
    try {
      const raw = localStorage.getItem(lsKey)
      if (!raw) return
      const saved: ArticleForm = JSON.parse(raw)
      if (saved.title || saved.body) {
        setLocalDraft(saved)
        setShowDraftBanner(true)
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const restoreLocalDraft = () => {
    if (!localDraft) return
    dispatch({ type: 'LOAD', payload: localDraft })
    editor?.commands.setContent(localDraft.body || '')
    setShowDraftBanner(false)
    setLocalDraft(null)
  }

  const dismissLocalDraft = () => {
    localStorage.removeItem(lsKey)
    setShowDraftBanner(false)
    setLocalDraft(null)
  }

  const clearLocalDraft = useCallback(() => {
    try { localStorage.removeItem(lsKey) } catch {}
  }, [lsKey])

  // ── Auto-save (every 15 s) ────────────────────────────────

  useEffect(() => {
    const timer = setInterval(async () => {
      if (!dirtyRef.current)    return
      if (saveInFlight.current) return

      try { localStorage.setItem(lsKey, JSON.stringify(formRef.current)) } catch {}

      if (!articleId.current) return

      saveInFlight.current = true
      try {
        await client.put(`/articles/${articleId.current}`, {
          ...formRef.current,
          status: formRef.current.status === 'published' ? 'published' : 'draft',
        })
        dispatch({ type: 'RESET_DIRTY' })
        clearLocalDraft()
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } catch {
        // Silent auto-save failure
      } finally {
        saveInFlight.current = false
      }
    }, 15_000)

    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Title → slug ──────────────────────────────────────────

  const handleTitleChange = (val: string) => {
    dispatch({ type: 'SET_FIELD', field: 'title', value: val })
    if (!slugLocked) {
      dispatch({ type: 'SET_FIELD', field: 'slug', value: generateSlug(val) })
    }
  }

  // ── Save ──────────────────────────────────────────────────

  const doSave = useCallback(async (
    statusOverride?: 'draft' | 'published' | 'archived',
  ) => {
    if (saveInFlight.current) return
    saveInFlight.current = true
    setSaving(true)
    setSaveStatus('saving')
    setSaveError('')

    const payload = { ...form, status: statusOverride ?? form.status }

    try {
      if (isNew && !articleId.current) {
        const res   = await client.post('/articles', payload)
        const newId = res.data?.data?.id ?? res.data?.id
        if (newId) {
          articleId.current = newId
          dispatch({ type: 'RESET_DIRTY' })
          clearLocalDraft()
          setSaveStatus('saved')
          navigate(`/admin/editor/${newId}`, { replace: true })
        }
      } else {
        await client.put(`/articles/${articleId.current}`, payload)
        dispatch({ type: 'RESET_DIRTY' })
        clearLocalDraft()
        setSaveStatus('saved')
      }
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (e: any) {
      setSaveStatus('error')
      setSaveError(
        e?.response?.status === 403
          ? 'You don\'t have permission to update this article.'
          : e?.response?.data?.message ?? 'Save failed. Please try again.'
      )
    } finally {
      setSaving(false)
      saveInFlight.current = false
    }
  }, [form, isNew, navigate, clearLocalDraft])

  // ── Publish confirmation ──────────────────────────────────

  const [serverStatus,     setServerStatus]     = useState<string>('')
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishIntent,    setPublishIntent]    = useState<'publish' | 'update'>('publish')

  const serverStatusSet = useRef(false)
  useEffect(() => {
    if (!isNew && form.status && !serverStatusSet.current) {
      setServerStatus(form.status)
      serverStatusSet.current = true
    }
  }, [form.status, isNew])

  const isAlreadyPublished = serverStatus === 'published'

  const requestPublish = () => {
    setPublishIntent(isAlreadyPublished ? 'update' : 'publish')
    setShowPublishModal(true)
  }

  const confirmPublish = () => {
    setShowPublishModal(false)
    doSave('published')
  }

  // ── Cover image upload ────────────────────────────────────

  const uploadCover = useCallback(async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setCoverError('Cover image must be under 5 MB.')
      return
    }
    setCoverUploading(true)
    setCoverError('')
    try {
      const fd = new FormData()
      fd.append('cover_image', file)

      const res = await client.post('/uploads/cover', fd, {
        headers: { 'Content-Type': undefined },
      })

      const coverUrl: string = res.data?.data?.url ?? ''
      if (!coverUrl) throw new Error('Upload succeeded but no URL was returned.')
      dispatch({ type: 'SET_FIELD', field: 'cover_image',    value: coverUrl })
      dispatch({ type: 'SET_FIELD', field: 'cover_position', value: '50% 50%' })
    } catch (e: any) {
      setCoverError(e?.response?.data?.message ?? e?.message ?? 'Upload failed. Please try again.')
    } finally {
      setCoverUploading(false)
    }
  }, [])

  // ── NEW: Inline image upload (editor body) ────────────────
  // Uploads to /uploads/image, inserts the returned URL into Tiptap.

  const uploadInlineImage = useCallback(async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setImageError('Inline image must be under 10 MB.')
      return
    }
    if (!editor) return

    setImageUploading(true)
    setImageError('')

    try {
      const fd = new FormData()
      fd.append('cover_image', file)

      const res = await client.post('/uploads/cover', fd, {
        headers: { 'Content-Type': undefined },
      })

      const imageUrl: string = res.data?.data?.url ?? ''
      if (!imageUrl) throw new Error('Upload succeeded but no URL was returned.')

      // Insert into Tiptap at current cursor
      editor.chain().focus().setImage({ src: imageUrl }).run()
    } catch (e: any) {
      setImageError(
        e?.response?.data?.message ?? e?.message ?? 'Image upload failed. Please try again.'
      )
    } finally {
      setImageUploading(false)
    }
  }, [editor])

  // ── Delete ────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!articleId.current) return
    setDeleting(true)
    setDeleteError('')
    try {
      await client.delete(`/articles/${articleId.current}`)
      navigate('/admin/editor', { replace: true })
    } catch (e: any) {
      setDeleteError(
        e?.response?.status === 403
          ? 'You can only delete your own articles.'
          : e?.response?.data?.message ?? 'Delete failed.'
      )
    } finally {
      setDeleting(false)
    }
  }

  // ── Loading / error states ────────────────────────────────

  if (loadingArticle) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertTriangle size={28} style={{ color: 'var(--breaking)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--breaking)' }}>{loadError}</p>
        <button
          onClick={() => navigate('/admin/editor')}
          className="text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Back to articles
        </button>
      </div>
    )
  }

  // ── Save status indicator ─────────────────────────────────

  const saveLabel = saveStatus === 'saving' ? 'Saving…'
    : saveStatus === 'saved'  ? '✓ Saved'
    : saveStatus === 'error'  ? '⚠ Error'
    : dirty                   ? 'Unsaved changes'
    : ''

  const saveLabelColor = saveStatus === 'saved'  ? '#16a34a'
    : saveStatus === 'error' ? 'var(--breaking)'
    : 'var(--text-muted)'

  // ── Render ────────────────────────────────────────────────

  return (
    <div style={{ color: 'var(--text-primary)' }}>

      {/* ── Topbar ── */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => safeNavigate('/admin/editor')}
            className="flex-shrink-0 p-2 rounded-xl transition-colors hover:bg-[var(--bg-subtle)]"
            style={{ color: 'var(--text-muted)' }}
            title="Back to articles"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="min-w-0">
            <h1 className="text-base font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              {isNew ? 'New Article' : (form.title || 'Edit Article')}
            </h1>
            {saveLabel && (
              <p className="text-xs mt-0.5" style={{ color: saveLabelColor }}>
                {saveLabel}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!isNew && form.slug && form.status === 'published' && (
            <a
              href={`/article/${form.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                         text-xs font-medium transition-colors hover:bg-[var(--bg-subtle)]"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              <Eye size={12} /> View live
            </a>
          )}
          <button
            onClick={() => doSave('draft')}
            disabled={saving || !dirty}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium
                       disabled:opacity-40 transition-opacity hover:opacity-80"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            <Save size={14} />
            <span className="hidden sm:inline">Save Draft</span>
          </button>
          <button
            onClick={requestPublish}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
                       disabled:opacity-50 transition-opacity hover:opacity-85"
            style={{
              background: isAlreadyPublished ? '#16a34a' : 'var(--accent)',
              color: '#fff',
            }}
          >
            {saving
              ? <Loader2 size={14} className="animate-spin" />
              : isAlreadyPublished
                ? <RefreshCw size={14} />
                : <Globe size={14} />
            }
            {isAlreadyPublished ? 'Update Live' : 'Publish'}
          </button>
        </div>
      </div>

      {/* ── Local draft recovery banner ── */}
      {showDraftBanner && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl mb-4"
          style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)' }}
        >
          <div className="flex items-center gap-2 text-sm font-medium"
            style={{ color: 'var(--accent)' }}>
            <Save size={14} />
            A locally saved draft was found. Restore it?
          </div>
          <div className="flex gap-2">
            <button
              onClick={restoreLocalDraft}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold
                         transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              Restore
            </button>
            <button
              onClick={dismissLocalDraft}
              className="px-3 py-1.5 rounded-lg text-xs font-medium
                         transition-colors hover:bg-[var(--bg-subtle)]"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {saveError && (
        <div
          className="flex items-center gap-2 p-3 rounded-xl mb-4 text-sm"
          style={{
            background: 'rgba(185,28,28,0.07)',
            color: 'var(--breaking)',
            border: '1px solid rgba(185,28,28,0.12)',
          }}
        >
          <AlertTriangle size={14} /> {saveError}
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* ════ LEFT — editor ════ */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Title + Subtitle + Slug */}
          <div
            className="rounded-2xl p-4 sm:p-6"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <textarea
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Article headline…"
              rows={2}
              className="w-full bg-transparent outline-none resize-none font-display
                         text-2xl sm:text-3xl font-black leading-tight"
              style={{ color: 'var(--text-primary)' }}
            />
            <input
              value={form.subtitle}
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'subtitle', value: e.target.value })}
              placeholder="Subtitle (optional)…"
              className="w-full bg-transparent outline-none text-base mt-2"
              style={{ color: 'var(--text-secondary)' }}
            />
            <div
              className="flex items-center gap-2 mt-4 px-3 py-2 rounded-xl"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                /article/
              </span>
              <input
                value={form.slug}
                onChange={e => dispatch({ type: 'SET_FIELD', field: 'slug', value: e.target.value })}
                disabled={slugLocked}
                placeholder="url-slug"
                className="flex-1 bg-transparent outline-none text-xs font-mono"
                style={{
                  color:   slugLocked ? 'var(--text-muted)' : 'var(--text-primary)',
                  opacity: slugLocked ? 0.6 : 1,
                }}
              />
              <button
                type="button"
                onClick={() => setSlugLocked(v => !v)}
                className="flex-shrink-0 p-1 rounded transition-colors hover:bg-[var(--bg-subtle)]"
                style={{ color: 'var(--text-muted)' }}
                title={slugLocked ? 'Unlock slug' : 'Lock slug'}
              >
                {slugLocked ? <Lock size={12} /> : <Unlock size={12} />}
              </button>
            </div>
          </div>

          {/* Rich text editor with drag-and-drop image upload */}
          <div
            className="rounded-2xl p-4 sm:p-5"
            style={{
              background: 'var(--bg-surface)',
              border:     `1px solid ${editorDragOver ? 'var(--accent)' : 'var(--border)'}`,
              transition: 'border-color 0.15s',
            }}
            onDragOver={e => {
              // Only intercept if payload has files
              if (e.dataTransfer.types.includes('Files')) {
                e.preventDefault()
                setEditorDragOver(true)
              }
            }}
            onDragLeave={e => {
              // Only clear if we're leaving the container entirely (not a child)
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setEditorDragOver(false)
              }
            }}
            onDrop={async e => {
              const file = e.dataTransfer.files?.[0]
              if (file && file.type.startsWith('image/')) {
                e.preventDefault()
                setEditorDragOver(false)
                await uploadInlineImage(file)
              } else {
                // Not an image — let Tiptap handle it (e.g. text drops)
                setEditorDragOver(false)
              }
            }}
          >
            {editor && (
              <Toolbar
                editor={editor}
                onImageUpload={uploadInlineImage}
                imageUploading={imageUploading}
              />
            )}

            {/* Inline image error */}
            {imageError && (
              <div
                className="flex items-center gap-2 p-2.5 rounded-xl mb-3 text-xs"
                style={{
                  background: 'rgba(185,28,28,0.07)',
                  color: 'var(--breaking)',
                  border: '1px solid rgba(185,28,28,0.12)',
                }}
              >
                <AlertTriangle size={12} /> {imageError}
                <button
                  type="button"
                  className="ml-auto"
                  onClick={() => setImageError('')}
                  style={{ color: 'var(--breaking)' }}
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Drag-over overlay hint */}
            {editorDragOver && (
              <div
                className="flex flex-col items-center justify-center gap-2 rounded-xl py-6 mb-3"
                style={{
                  background: 'var(--accent-light)',
                  border:     '2px dashed var(--accent)',
                }}
              >
                <Upload size={20} style={{ color: 'var(--accent)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                  Drop image to upload & insert
                </p>
              </div>
            )}

            <div
              className="prose prose-sm max-w-none min-h-[400px] outline-none"
              style={{ color: 'var(--text-primary)' }}
            >
              <style>{`
                .ProseMirror { min-height: 400px; outline: none; color: var(--text-primary); line-height: 1.75; font-size: 15px; }
                .ProseMirror p.is-editor-empty:first-child::before { color: var(--text-muted); content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
                .ProseMirror h2 { font-size: 1.4rem; font-weight: 800; margin: 1.5em 0 0.5em; color: var(--text-primary); }
                .ProseMirror h3 { font-size: 1.1rem; font-weight: 700; margin: 1.2em 0 0.4em; color: var(--text-primary); }
                .ProseMirror blockquote { border-left: 3px solid var(--accent); padding-left: 1rem; margin: 1.2em 0; color: var(--text-secondary); font-style: italic; }
                .ProseMirror a { color: var(--accent); text-decoration: underline; }
                .ProseMirror ul { padding-left: 1.5rem; margin: 0.8em 0; list-style: disc; }
                .ProseMirror ol { padding-left: 1.5rem; margin: 0.8em 0; list-style: decimal; }
                .ProseMirror li { display: list-item; margin: 0.3em 0; color: var(--text-primary); }
                .ProseMirror hr { border-color: var(--border); margin: 1.5em 0; }
                .ProseMirror img { max-width: 100%; border-radius: 10px; margin: 1em 0; }
                .ProseMirror code { background: var(--bg-subtle); padding: 0.1em 0.4em; border-radius: 4px; font-size: 0.85em; }
                .ProseMirror pre { background: var(--bg-subtle); padding: 1em; border-radius: 8px; overflow-x: auto; }
              `}</style>
              <EditorContent editor={editor} />
            </div>

            {editor && (
              <div className="flex justify-end mt-3">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {editor.storage.characterCount.characters().toLocaleString()} characters
                </span>
              </div>
            )}
          </div>

          {/* Excerpt */}
          <div
            className="rounded-2xl p-4 sm:p-5"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}>
                Excerpt
              </label>
              <span
                className="text-xs"
                style={{
                  color: form.excerpt.length > 270
                    ? 'var(--breaking)' : 'var(--text-muted)',
                }}
              >
                {form.excerpt.length}/300
              </span>
            </div>
            <textarea
              value={form.excerpt}
              onChange={e => dispatch({ type: 'SET_FIELD', field: 'excerpt', value: e.target.value })}
              placeholder="Brief summary shown in article cards (auto-generated if left empty)…"
              rows={3}
              maxLength={300}
              className="w-full bg-transparent outline-none text-sm resize-none"
              style={{ color: 'var(--text-secondary)' }}
            />
          </div>

        </div>

        {/* ════ RIGHT — sidebar ════ */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-4">

          {/* Publish panel */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-muted)' }}>
              Publish
            </p>

            <label className="block mb-3">
              <span className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
                Status
              </span>
              <select
                value={form.status}
                onChange={e => dispatch({
                  type: 'SET_FIELD',
                  field: 'status',
                  value: e.target.value as ArticleForm['status'],
                })}
                className="w-full px-3 py-2 rounded-xl text-sm font-medium outline-none cursor-pointer"
                style={{
                  background: 'var(--bg)',
                  border:     '1px solid var(--border)',
                  color:      'var(--text-primary)',
                }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>

            {isEditorPlus && (
              <div className="space-y-2.5 mb-4">
                <Toggle
                  label="Featured"
                  icon={<Star size={13} />}
                  checked={form.is_featured}
                  onChange={v => dispatch({ type: 'SET_FIELD', field: 'is_featured', value: v })}
                />
                <Toggle
                  label="Breaking news"
                  icon={<Zap size={13} />}
                  checked={form.is_breaking}
                  onChange={v => dispatch({ type: 'SET_FIELD', field: 'is_breaking', value: v })}
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => doSave('draft')}
                disabled={saving || !dirty}
                className="flex-1 py-2 rounded-xl text-xs font-semibold
                           disabled:opacity-40 transition-opacity hover:opacity-80"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                {saving && saveStatus === 'saving' ? 'Saving…' : 'Save Draft'}
              </button>
              <button
                onClick={requestPublish}
                disabled={saving}
                className="flex-1 py-2 rounded-xl text-xs font-semibold
                           disabled:opacity-50 transition-opacity hover:opacity-85"
                style={{
                  background: isAlreadyPublished ? '#16a34a' : 'var(--accent)',
                  color: '#fff',
                }}
              >
                {saving ? '…' : isAlreadyPublished ? 'Update Live' : 'Publish'}
              </button>
            </div>
          </div>

          {/* Category */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-muted)' }}>
              Category
            </p>
            <select
              value={form.category_id}
              onChange={e => dispatch({
                type: 'SET_FIELD',
                field: 'category_id',
                value: e.target.value,
              })}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none cursor-pointer"
              style={{
                background: 'var(--bg)',
                border:     '1px solid var(--border)',
                color:      form.category_id ? 'var(--text-primary)' : 'var(--text-muted)',
              }}
            >
              <option value="">Select a category…</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* ── Cover image (+ position picker) ── */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-muted)' }}>
              Cover Image
            </p>

            {coverError && (
              <p className="text-xs mb-2" style={{ color: 'var(--breaking)' }}>{coverError}</p>
            )}

            {form.cover_image ? (
              <div>
                {/* Preview with current object-position applied */}
                <div className="relative">
                  <div
                    className="w-full rounded-xl overflow-hidden"
                    style={{ height: 140 }}
                  >
                    <img
                      src={form.cover_image}
                      alt="Cover preview"
                      style={{
                        width:          '100%',
                        height:         '100%',
                        objectFit:      'cover',
                        objectPosition: form.cover_position,
                      }}
                    />
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => {
                      dispatch({ type: 'SET_FIELD', field: 'cover_image',    value: '' })
                      dispatch({ type: 'SET_FIELD', field: 'cover_position', value: '50% 50%' })
                    }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center
                               justify-center transition-opacity hover:opacity-80"
                    style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
                    title="Remove cover"
                  >
                    <X size={12} />
                  </button>
                </div>

                {/* Replace button */}
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="mt-2 w-full py-1.5 rounded-xl text-xs font-medium
                             transition-colors hover:bg-[var(--bg-subtle)]"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                >
                  Replace image
                </button>

                {/* ── Position picker (NEW) ── */}
                <CoverPositionPicker
                  imageUrl={form.cover_image}
                  position={form.cover_position}
                  onChange={pos => dispatch({
                    type: 'SET_FIELD', field: 'cover_position', value: pos,
                  })}
                />
              </div>
            ) : (
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault()
                  setDragOver(false)
                  const f = e.dataTransfer.files[0]
                  if (f) uploadCover(f)
                }}
                onClick={() => !coverUploading && coverInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-xl
                           py-8 cursor-pointer transition-all"
                style={{
                  border:     `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
                  background: dragOver ? 'var(--accent-light)' : 'var(--bg)',
                }}
              >
                {coverUploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent)' }} />
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Uploading…</p>
                  </>
                ) : (
                  <>
                    <Upload size={20} style={{ color: 'var(--text-muted)' }} />
                    <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                      Drag & drop or click to upload
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                      JPEG, PNG, WebP · Max 5 MB
                    </p>
                  </>
                )}
              </div>
            )}

            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) uploadCover(f)
                e.target.value = ''
              }}
            />
          </div>

          {/* SEO panel */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <button
              type="button"
              onClick={() => setSeoOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3
                         transition-colors hover:bg-[var(--bg-subtle)]"
            >
              <p className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--text-muted)' }}>
                SEO
              </p>
              {seoOpen
                ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
                : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              }
            </button>

            {seoOpen && (
              <div className="px-4 pb-4 space-y-3">
                <div>
                  <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>
                    Meta title
                  </label>
                  <input
                    value={form.meta_title}
                    onChange={e => dispatch({
                      type: 'SET_FIELD', field: 'meta_title', value: e.target.value,
                    })}
                    placeholder={form.title || 'Meta title…'}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-transparent outline-none"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Meta description
                    </label>
                    <span
                      className="text-[11px]"
                      style={{
                        color: form.meta_description.length > 160
                          ? 'var(--breaking)' : 'var(--text-muted)',
                      }}
                    >
                      {form.meta_description.length}/160
                    </span>
                  </div>
                  <textarea
                    value={form.meta_description}
                    onChange={e => dispatch({
                      type: 'SET_FIELD', field: 'meta_description', value: e.target.value,
                    })}
                    placeholder="Meta description for search engines…"
                    rows={3}
                    maxLength={160}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-transparent
                               outline-none resize-none"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Danger zone */}
          {canDelete && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border:     '1px solid rgba(185,28,28,0.18)',
                background: 'rgba(185,28,28,0.02)',
              }}
            >
              <button
                type="button"
                onClick={() => setDangerOpen(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3
                           transition-opacity hover:opacity-70"
              >
                <p className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--breaking)' }}>
                  Danger zone
                </p>
                {dangerOpen
                  ? <ChevronUp size={14} style={{ color: 'var(--breaking)' }} />
                  : <ChevronDown size={14} style={{ color: 'var(--breaking)' }} />
                }
              </button>

              {dangerOpen && (
                <div className="px-4 pb-4">
                  {deleteError && (
                    <p className="text-xs mb-3" style={{ color: 'var(--breaking)' }}>
                      {deleteError}
                    </p>
                  )}
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                               text-sm font-semibold disabled:opacity-50 transition-opacity
                               hover:opacity-80"
                    style={{ background: 'var(--breaking)', color: '#fff' }}
                  >
                    {deleting
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Trash2 size={14} />
                    }
                    {deleting ? 'Deleting…' : 'Delete article'}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Publish confirmation modal ── */}
      {showPublishModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowPublishModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="px-6 pt-6 pb-4"
              style={{
                background: publishIntent === 'update'
                  ? 'linear-gradient(135deg, rgba(22,163,74,0.08), rgba(22,163,74,0.03))'
                  : 'linear-gradient(135deg, rgba(var(--accent-rgb),0.08), rgba(var(--accent-rgb),0.03))',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: publishIntent === 'update'
                      ? 'rgba(22,163,74,0.12)' : 'var(--accent-light)',
                  }}
                >
                  <ShieldAlert
                    size={20}
                    style={{
                      color: publishIntent === 'update' ? '#16a34a' : 'var(--accent)',
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    {publishIntent === 'update'
                      ? 'Update live article?'
                      : 'Publish to the public?'}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {publishIntent === 'update'
                      ? 'Changes will be visible to all readers immediately.'
                      : 'This will make the article publicly visible right now.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'var(--text-muted)' }}>
                Before you {publishIntent === 'update' ? 'update' : 'publish'}, confirm:
              </p>

              <div className="space-y-2.5">
                {[
                  'Headline is accurate and not misleading',
                  'All facts, names, and dates have been verified',
                  'Article has been proofread for errors',
                  'Cover image is appropriate and properly sourced',
                  'Category correctly classifies this article',
                ].map((text, i) => (
                  <CheckItem key={i} text={text} />
                ))}
              </div>

              <div
                className="mt-4 p-3 rounded-xl text-xs leading-relaxed"
                style={{
                  background: 'rgba(185,28,28,0.05)',
                  border:     '1px solid rgba(185,28,28,0.15)',
                  color:      'var(--text-secondary)',
                }}
              >
                <span className="font-bold" style={{ color: 'var(--breaking)' }}>
                  Editorial responsibility:{' '}
                </span>
                By {publishIntent === 'update' ? 'updating' : 'publishing'} this article,{' '}
                <strong>{user?.full_name ?? 'you'}</strong> confirm that the content is
                accurate, fair, and meets this publication's editorial standards.
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors
                           hover:bg-[var(--bg-subtle)]"
                style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                Go back
              </button>
              <button
                onClick={confirmPublish}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
                           text-sm font-bold disabled:opacity-50 transition-opacity
                           hover:opacity-85"
                style={{
                  background: publishIntent === 'update' ? '#16a34a' : 'var(--accent)',
                  color: '#fff',
                }}
              >
                {saving
                  ? <Loader2 size={14} className="animate-spin" />
                  : publishIntent === 'update'
                    ? <><RefreshCw size={14} /> Yes, update</>
                    : <><Globe size={14} /> Yes, publish</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ── Toggle helper ──────────────────────────────────────────────

function Toggle({
  label, icon, checked, onChange,
}: {
  label:    string
  icon:     React.ReactNode
  checked:  boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full px-3 py-2 rounded-xl
                 transition-colors hover:bg-[var(--bg-subtle)]"
      style={{ border: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-2">
        <span style={{ color: checked ? 'var(--accent)' : 'var(--text-muted)' }}>{icon}</span>
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</span>
      </div>
      <div
        className="w-9 h-5 rounded-full relative transition-colors flex-shrink-0"
        style={{ background: checked ? 'var(--accent)' : 'var(--bg-subtle)' }}
      >
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
          style={{
            left:       checked ? 'calc(100% - 1.1rem)' : '0.125rem',
            background: checked ? '#fff' : 'var(--text-muted)',
          }}
        />
      </div>
    </button>
  )
}

// ── CheckItem — checklist row inside publish modal ────────────

function CheckItem({ text }: { text: string }) {
  const [checked, setChecked] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setChecked(v => !v)}
      className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl
                 transition-colors hover:bg-[var(--bg-subtle)]"
      style={{
        border:     `1px solid ${checked ? 'rgba(22,163,74,0.3)' : 'var(--border)'}`,
        background: checked ? 'rgba(22,163,74,0.04)' : 'transparent',
      }}
    >
      <div
        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
        style={{
          background: checked ? '#16a34a' : 'var(--bg)',
          border:     `1.5px solid ${checked ? '#16a34a' : 'var(--border)'}`,
        }}
      >
        {checked && <CheckCircle2 size={11} color="#fff" strokeWidth={3} />}
      </div>
      <span
        className="text-sm"
        style={{ color: checked ? 'var(--text-primary)' : 'var(--text-secondary)' }}
      >
        {text}
      </span>
    </button>
  )
}