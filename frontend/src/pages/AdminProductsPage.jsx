import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import { formatPrice, titleCase } from '../utils/format'

const EMPTY_FORM = { name: '', price: '', category: '', stock: '', description: '', image_url: '' }

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null = closed, {} = create, {id...} = edit
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Existing categories power the category combobox suggestions.
  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  )

  function load() {
    setLoading(true)
    api
      .get('/products')
      .then((res) => setProducts(res.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setForm(EMPTY_FORM)
    setErrors({})
    setEditing({})
  }

  function openEdit(product) {
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      stock: product.stock,
      description: product.description ?? '',
      image_url: product.image_url ?? '',
    })
    setErrors({})
    setEditing(product)
  }

  // Tidy free-text fields to Title Case when the admin leaves them.
  function tidy(field) {
    setForm((f) => ({ ...f, [field]: titleCase(f[field]).trim() }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    const payload = {
      ...form,
      name: titleCase(form.name).trim(),
      category: titleCase(form.category).trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      description: form.description || null,
      image_url: form.image_url || null,
    }
    try {
      if (editing.id) {
        await api.put(`/products/${editing.id}`, payload)
      } else {
        await api.post('/products', payload)
      }
      setEditing(null)
      load()
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {})
      } else {
        setErrors({ _: ['Save failed. Please try again.'] })
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(product) {
    if (!confirm(`Delete "${product.name}"?`)) return
    await api.delete(`/products/${product.id}`)
    load()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={openCreate}
          className="btn-press rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New product
        </button>
      </div>

      {loading ? (
        <p className="py-16 text-center text-gray-400">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">{p.category}</td>
                  <td className="px-4 py-3 text-gray-600">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock < 1 ? 'text-red-600' : 'text-gray-600'}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(p)} className="font-medium text-indigo-600 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(p)} className="ml-4 font-medium text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== null && (
        <div className="fade-in fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleSave} className="modal-pop w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">
              {editing.id ? 'Edit product' : 'New product'}
            </h2>

            {errors._ && <p className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{errors._[0]}</p>}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" error={errors.name} className="col-span-2">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onBlur={() => tidy('name')}
                  className="input"
                />
              </Field>

              <Field label="Price" error={errors.price}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="input pl-7"
                    placeholder="0.00"
                  />
                </div>
              </Field>

              <Field label="Stock" error={errors.stock}>
                <input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="input"
                  placeholder="0"
                />
              </Field>

              <Field label="Category" error={errors.category} className="col-span-2">
                <input
                  list="category-options"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  onBlur={() => tidy('category')}
                  className="input"
                  placeholder="Pick or type a category"
                />
                <datalist id="category-options">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>

              <Field label="Image URL" error={errors.image_url} className="col-span-2">
                <input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://…"
                  className="input"
                />
              </Field>

              <Field label="Description" error={errors.description} className="col-span-2">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input"
                />
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="btn-press rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-press rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function Field({ label, error, className = '', children }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error[0]}</p>}
    </div>
  )
}
