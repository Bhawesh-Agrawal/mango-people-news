import { useState, useEffect, useCallback, useRef } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, useSortable,
  verticalListSortingStrategy, sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical, Plus, X, Search, Save, Loader2,
  AlertTriangle, Check, Layout,
} from 'lucide-react'
import { client } from '../api/client'
import { cloudinaryUrl } from '../lib/utils'
import {
  getHeroPins, addHeroPin, reorderHeroPins, removeHeroPin,
  getCategoryPins, addCategoryPin, removeCategoryPin,
  searchArticles,
  type HeroPin, type CategoryPin, type SearchArticle,
} from '../api/adminHome'

interface Category {
  id: string; name: string; slug: string; color: string
}

// ── Sortable pin card ──────────────────────────────────────────

function SortablePinCard({
  pin, onRemove,
}: {
  pin: HeroPin
  onRemove: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: pin.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex:   isDragging ? 10 : 'auto' as unknown as number,
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: 'var(--bg)',
        border:     '1px solid var(--border)',
      }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
    >
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 p-0.5 rounded cursor-grab active:cursor-grabbing"
        style={{ color: 'var(--text-muted)' }}
        aria-label="Drag to reorder"
      >
        <GripVertical size={15} />
      </button>

      <div
        className="w-12 h-7 rounded-lg flex-shrink-0 overflow-hidden"
        style={{ aspectRatio: '16/9' }}
      >
        {pin.cover_image ? (
          <img
            src={cloudinaryUrl(pin.cover_image, 96, 54)}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-[9px] font-bold"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
          >
            No img
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
          {pin.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: pin.category_color + '20', color: pin.category_color }}
          >
            {pin.category_name}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            #{pin.position + 1}
          </span>
        </div>
      </div>

      <button
        onClick={() => onRemove(pin.id)}
        className="flex-shrink-0 p-1 rounded-lg transition-colors hover:bg-[var(--bg-subtle)]"
        style={{ color: 'var(--text-muted)' }}
        aria-label="Remove pin"
      >
        <X size={13} />
      </button>
    </div>
  )
}

// ── Search modal ───────────────────────────────────────────────

function SearchModal({
  open, onClose, onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (article: SearchArticle) => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchArticle[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await searchArticles(q)
      setResults(res.data.data)
    } catch { setResults([]) }
    finally { setLoading(false) }
  }, [])

  const handleChange = (val: string) => {
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 300)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              ref={inputRef}
              value={query}
              onChange={e => handleChange(e.target.value)}
              placeholder="Search articles by title…"
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-primary)' }}
            />
            {loading && <Loader2 size={13} className="animate-spin" style={{ color: 'var(--text-muted)' }} />}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto px-4 pb-4 space-y-1.5">
          {results.length === 0 && query.length >= 2 && !loading && (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>
              No articles found
            </p>
          )}
          {results.map(article => (
            <button
              key={article.id}
              onClick={() => onSelect(article)}
              className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-xl transition-colors hover:bg-[var(--bg-subtle)]"
              style={{ border: '1px solid var(--border)' }}
            >
              <div
                className="w-14 h-8 rounded flex-shrink-0 overflow-hidden"
                style={{ aspectRatio: '16/9' }}
              >
                {article.cover_image ? (
                  <img
                    src={cloudinaryUrl(article.cover_image, 112, 63)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-[8px] font-bold"
                    style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
                  >
                    No img
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {article.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                    style={{ background: article.category_color + '20', color: article.category_color }}
                  >
                    {article.category_name}
                  </span>
                  {article.published_at && (
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {new Date(article.published_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'var(--accent)' }}>
                Select
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────

export default function AdminHomepageEditor() {
  const [activeTab, setActiveTab] = useState<'hero' | 'category'>('hero')

  // Hero pins
  const [heroPins, setHeroPins] = useState<HeroPin[]>([])
  const [heroLoading, setHeroLoading] = useState(true)
  const [heroError, setHeroError] = useState('')
  const [heroSaving, setHeroSaving] = useState(false)

  // Category pins
  const [categoryPins, setCategoryPins] = useState<CategoryPin[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [catLoading, setCatLoading] = useState(true)
  const [catError, setCatError] = useState('')

  // Search modal
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchMode, setSearchMode] = useState<'hero' | 'category'>('hero')
  const [searchCatId, setSearchCatId] = useState<string | undefined>()

  // Notifications
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message })
    setTimeout(() => setNotice(null), 4000)
  }

  // ── Drag sensors ────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // ── Load data ────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setHeroLoading(true)
    setCatLoading(true)
    try {
      const [heroRes, catPinRes, catRes] = await Promise.all([
        getHeroPins(),
        getCategoryPins(),
        client.get('/categories'),
      ])
      setHeroPins(heroRes.data.data)
      setCategoryPins(catPinRes.data.data)
      setCategories(catRes.data?.data ?? [])
    } catch {
      setHeroError('Failed to load homepage data')
      setCatError('Failed to load categories')
    } finally {
      setHeroLoading(false)
      setCatLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ── Hero pin handlers ───────────────────────────────────────

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = heroPins.findIndex(p => p.id === active.id)
    const newIndex = heroPins.findIndex(p => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    setHeroPins(prev => arrayMove(prev, oldIndex, newIndex))
  }

  const handleAddHeroPin = async (article: SearchArticle) => {
    setSearchOpen(false)
    try {
      const res = await addHeroPin(article.id, heroPins.length)
      if (heroPins.some(p => p.article_id === article.id)) {
        showNotice('success', 'Article already pinned — position updated')
      } else {
        const newPin: HeroPin = {
          id: res.data.data.id,
          article_id: article.id,
          position: heroPins.length,
          pinned_at: new Date().toISOString(),
          title: article.title,
          slug: article.slug,
          cover_image: article.cover_image,
          excerpt: article.excerpt,
          published_at: article.published_at ?? '',
          category_name: article.category_name,
          category_slug: article.category_slug,
          category_color: article.category_color,
        }
        setHeroPins(prev => [...prev, newPin])
        showNotice('success', 'Article pinned to hero')
      }
    } catch {
      showNotice('error', 'Failed to pin article')
    }
  }

  const handleRemoveHeroPin = async (pinId: string) => {
    try {
      await removeHeroPin(pinId)
      setHeroPins(prev => prev.filter(p => p.id !== pinId))
      showNotice('success', 'Hero pin removed')
    } catch {
      showNotice('error', 'Failed to remove pin')
    }
  }

  const handleSaveHeroOrder = async () => {
    setHeroSaving(true)
    try {
      const pins = heroPins.map((p, i) => ({ id: p.id, position: i }))
      await reorderHeroPins(pins)
      showNotice('success', 'Hero lineup saved')
    } catch {
      showNotice('error', 'Failed to save order')
    } finally {
      setHeroSaving(false)
    }
  }

  // ── Category pin handlers ───────────────────────────────────

  const handleAddCategoryPin = async (article: SearchArticle) => {
    setSearchOpen(false)
    const catId = searchCatId
    if (!catId) return

    try {
      await addCategoryPin(article.id, catId)
      showNotice('success', 'Article pinned to category')
      // Reload category pins to reflect the change
      const res = await getCategoryPins()
      setCategoryPins(res.data.data)
    } catch {
      showNotice('error', 'Failed to pin article to category')
    }
  }

  const handleRemoveCategoryPin = async (pinId: string) => {
    try {
      await removeCategoryPin(pinId)
      setCategoryPins(prev => prev.filter(p => p.id !== pinId))
      showNotice('success', 'Category pin removed')
    } catch {
      showNotice('error', 'Failed to remove category pin')
    }
  }

  const openSearchForCategory = (catId: string) => {
    setSearchMode('category')
    setSearchCatId(catId)
    setSearchOpen(true)
  }

  const openSearchForHero = () => {
    setSearchMode('hero')
    setSearchCatId(undefined)
    setSearchOpen(true)
  }

  // ── Build category lookup ────────────────────────────────────
  const pinsByCategory = new Map<string, CategoryPin[]>()
  for (const pin of categoryPins) {
    const existing = pinsByCategory.get(pin.category_id) || []
    existing.push(pin)
    pinsByCategory.set(pin.category_id, existing)
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={{ color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Layout size={18} style={{ color: 'var(--accent)' }} />
          Homepage Editor
        </h1>
      </div>

      {/* Notification */}
      {notice && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm"
          style={{
            background: notice.type === 'success'
              ? 'rgba(22,163,74,0.08)'
              : 'rgba(185,28,28,0.07)',
            border: notice.type === 'success'
              ? '1px solid rgba(22,163,74,0.2)'
              : '1px solid rgba(185,28,28,0.12)',
            color: notice.type === 'success' ? '#16a34a' : 'var(--breaking)',
          }}
        >
          {notice.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
          {notice.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5">
        {(['hero', 'category'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeTab === tab ? 'var(--accent)' : 'var(--bg-subtle)',
              color:      activeTab === tab ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {tab === 'hero' ? 'Hero Lineup' : 'Category Features'}
          </button>
        ))}
      </div>

      {/* ── HERO TAB ── */}
      {activeTab === 'hero' && (
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold">Hero Lineup</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Drag to reorder. Pinned articles appear first; remaining slots auto-fill with recent articles.
              </p>
            </div>
            <button
              onClick={openSearchForHero}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              <Plus size={13} />
              Add Article
            </button>
          </div>

          {heroError && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs"
              style={{ background: 'rgba(185,28,28,0.07)', color: 'var(--breaking)', border: '1px solid rgba(185,28,28,0.12)' }}
            >
              <AlertTriangle size={12} /> {heroError}
            </div>
          )}

          {heroLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ) : (
            <>
              {heroPins.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center gap-2 py-10 rounded-xl"
                  style={{ border: '2px dashed var(--border)' }}
                >
                  <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                    No articles pinned to the hero yet
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                    Click "Add Article" to feature an article on the homepage.
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={heroPins.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {heroPins.map(pin => (
                        <SortablePinCard
                          key={pin.id}
                          pin={pin}
                          onRemove={handleRemoveHeroPin}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {heroPins.length > 1 && (
                <button
                  onClick={handleSaveHeroOrder}
                  disabled={heroSaving}
                  className="flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  {heroSaving ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  {heroSaving ? 'Saving…' : 'Save Order'}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* ── CATEGORY TAB ── */}
      {activeTab === 'category' && (
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-sm font-bold mb-1">Category Features</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
            Pin an article to appear at the top of each category page.
          </p>

          {catError && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs"
              style={{ background: 'rgba(185,28,28,0.07)', color: 'var(--breaking)', border: '1px solid rgba(185,28,28,0.12)' }}
            >
              <AlertTriangle size={12} /> {catError}
            </div>
          )}

          {catLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ) : (
            <div className="space-y-2">
              {categories.map(cat => {
                const pins = pinsByCategory.get(cat.id) || []
                return (
                  <div
                    key={cat.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: cat.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {cat.name}
                      </p>
                      {pins.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {pins.map(pin => (
                            <span
                              key={pin.id}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-medium"
                              style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                            >
                              {pin.title}
                              <button
                                onClick={() => handleRemoveCategoryPin(pin.id)}
                                className="p-0.5 rounded hover:bg-[var(--bg)] transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                                aria-label={`Remove ${pin.title}`}
                              >
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          No featured article
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => openSearchForCategory(cat.id)}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors hover:bg-[var(--bg-subtle)]"
                      style={{ border: '1px solid var(--border)', color: 'var(--accent)' }}
                    >
                      {pins.length > 0 ? 'Change' : 'Select'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Search modal ── */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={searchMode === 'hero' ? handleAddHeroPin : handleAddCategoryPin}
      />
    </div>
  )
}
