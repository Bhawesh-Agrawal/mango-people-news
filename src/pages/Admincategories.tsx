import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/categories'
import type { Category } from '../types'
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, X, CheckCircle, AlertCircle, Loader } from 'lucide-react'

export default function AdminCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    color: '#6366f1',
    sort_order: 0,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getCategories()
      if (response.success) {
        setCategories(response.data.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)))
      } else {
        setError('Unable to load categories. Please try again.')
      }
    } catch (err: any) {
      setError('Connection failed. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      if (editingCategory) {
        const response = await updateCategory(editingCategory.id, formData)
        if (response.success) {
          setCategories(prev => prev.map(cat => cat.id === editingCategory.id ? response.data : cat).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)))
          setSuccess(`"${response.data.name}" has been updated successfully. Changes may take up to 1 hour to reflect across the site.`)
          setShowModal(false)
          setEditingCategory(null)
          resetForm()
        } else {
          setError(response.message || 'Failed to update category. Please try again.')
        }
      } else {
        const response = await createCategory(formData)
        if (response.success) {
          setCategories(prev => [...prev, response.data].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)))
          setSuccess(`"${response.data.name}" has been created successfully. Changes may take up to 1 hour to reflect across the site.`)
          setShowModal(false)
          resetForm()
        } else {
          setError(response.message || 'Failed to create category. Please try again.')
        }
      }
    } catch (err: any) {
      setError('Operation failed. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return
    setDeleting(true)
    setError(null)
    try {
      const response = await deleteCategory(categoryToDelete.id)
      if (response.success) {
        setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id))
        setSuccess(`"${categoryToDelete.name}" has been deleted successfully. Changes may take up to 1 hour to reflect across the site.`)
        setShowDeleteModal(false)
        setCategoryToDelete(null)
      } else {
        setError(response.message || 'Failed to delete category. Please try again.')
      }
    } catch (err: any) {
      setError('Deletion failed. Please check your connection and try again.')
    } finally {
      setDeleting(false)
    }
  }

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const index = categories.findIndex(cat => cat.id === id)
    if (direction === 'up' && index > 0) {
      const newCategories = [...categories]
      const temp = newCategories[index - 1].sort_order
      newCategories[index - 1].sort_order = newCategories[index].sort_order
      newCategories[index].sort_order = temp
      setCategories(newCategories.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)))
      try {
        await updateCategory(id, { sort_order: newCategories[index].sort_order })
        await updateCategory(newCategories[index - 1].id, { sort_order: newCategories[index - 1].sort_order })
        setSuccess('Category order updated successfully. Changes may take up to 1 hour to reflect across the site.')
      } catch (err) {
        // Revert on error
        fetchCategories()
        setError('Failed to update order. Please try again.')
      }
    } else if (direction === 'down' && index < categories.length - 1) {
      const newCategories = [...categories]
      const temp = newCategories[index + 1].sort_order
      newCategories[index + 1].sort_order = newCategories[index].sort_order
      newCategories[index].sort_order = temp
      setCategories(newCategories.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)))
      try {
        await updateCategory(id, { sort_order: newCategories[index].sort_order })
        await updateCategory(newCategories[index + 1].id, { sort_order: newCategories[index + 1].sort_order })
        setSuccess('Category order updated successfully. Changes may take up to 1 hour to reflect across the site.')
      } catch (err) {
        // Revert on error
        fetchCategories()
        setError('Failed to update order. Please try again.')
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: '', color: '#6366f1', sort_order: 0 })
  }

  const openModal = (category?: Category) => {
    setError(null)
    setSuccess(null)
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        color: category.color,
        sort_order: category.sort_order || 0,
      })
    } else {
      setEditingCategory(null)
      resetForm()
    }
    setShowModal(true)
  }

  const openDeleteModal = (category: Category) => {
    setCategoryToDelete(category)
    setShowDeleteModal(true)
  }

  const closeModals = () => {
    setShowModal(false)
    setShowDeleteModal(false)
    setEditingCategory(null)
    setCategoryToDelete(null)
    resetForm()
  }

  if (user?.role !== 'super_admin') {
    return (
      <div className="space-y-8 max-w-5xl">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Access Denied
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            You need super admin privileges to manage categories.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
            Categories
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Manage article categories and their order.
          </p>
          <div className="mt-3 p-3 rounded-lg text-sm" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            <strong>Note:</strong> Changes to categories may take up to 1 hour to reflect across the site due to caching.
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm flex items-center gap-3" style={{ background: 'rgba(185,28,28,0.06)', color: 'var(--breaking)', border: '1px solid rgba(185,28,28,0.15)' }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl px-4 py-3 text-sm flex items-center gap-3" style={{ background: 'rgba(34,197,94,0.06)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.15)' }}>
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl" style={{ background: 'var(--bg-subtle)' }} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {category.name}
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {category.article_count} articles • Order: {category.sort_order}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMove(category.id, 'up')}
                  disabled={index === 0}
                  className="p-1 rounded hover:bg-opacity-20 disabled:opacity-50"
                  style={{ background: 'var(--bg-subtle)' }}
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => handleMove(category.id, 'down')}
                  disabled={index === categories.length - 1}
                  className="p-1 rounded hover:bg-opacity-20 disabled:opacity-50"
                  style={{ background: 'var(--bg-subtle)' }}
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  onClick={() => openModal(category)}
                  className="p-2 rounded hover:bg-opacity-20"
                  style={{ background: 'var(--bg-subtle)' }}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => openDeleteModal(category)}
                  className="p-2 rounded hover:bg-opacity-20 text-red-500"
                  style={{ background: 'var(--bg-subtle)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 w-full max-w-md mx-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-10 border rounded-lg"
                  style={{ borderColor: 'var(--border)' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border rounded-lg"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'var(--accent)' }}
                >
                  {submitting && <Loader size={16} className="animate-spin" />}
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 px-4 py-2 border rounded-lg font-semibold"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 w-full max-w-md mx-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(185,28,28,0.1)' }}>
                <AlertCircle size={20} style={{ color: 'var(--breaking)' }} />
              </div>
              <div>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Delete Category
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to delete <strong>"{categoryToDelete.name}"</strong>? This will permanently remove the category and cannot be recovered.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'var(--breaking)' }}
              >
                {deleting && <Loader size={16} className="animate-spin" />}
                Delete Category
              </button>
              <button
                onClick={closeModals}
                className="flex-1 px-4 py-2 border rounded-lg font-semibold"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}