import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice } from '../utils/format'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const outOfStock = product.stock < 1

  function handleAdd() {
    addItem(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <Link to={`/products/${product.id}`} className="block aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-indigo-500">
          {product.category}
        </span>
        <Link to={`/products/${product.id}`} className="mt-1 line-clamp-1 font-semibold text-gray-900 hover:text-indigo-600">
          {product.name}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{product.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
          <button
            disabled={outOfStock}
            onClick={handleAdd}
            className={`min-w-[76px] rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 ${
              added ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {outOfStock ? 'Sold out' : added ? 'Added ✓' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
