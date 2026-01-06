'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  etsyId: string;
  title: string;
  price: number;
  quantity: number;
  state: string;
  syncStatus: string;
  lastSyncedAt: string | null;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Simple password check (in production, use proper authentication)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, password is "admin123"
    // In production, implement proper authentication
    if (password === 'admin123') {
      setAuthenticated(true);
      setError('');
      loadProducts();
    } else {
      setError('Invalid password');
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncFromEtsy = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/sync/etsy-to-db');
      const data = await response.json();
      alert(data.message);
      loadProducts();
    } catch (error) {
      alert('Sync failed: ' + error);
    } finally {
      setSyncing(false);
    }
  };

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        loadProducts();
      } else {
        alert('Update failed');
      }
    } catch (error) {
      alert('Update failed: ' + error);
    }
  };

  const syncToEtsy = async (productId: string) => {
    try {
      const response = await fetch('/api/sync/db-to-etsy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();
      alert(data.message || data.error);
      loadProducts();
    } catch (error) {
      alert('Sync failed: ' + error);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 rounded bg-white/20 border border-white/30 text-white placeholder-gray-400 mb-4"
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded"
            >
              Login
            </button>
          </form>
          <p className="text-sm text-gray-400 mt-4 text-center">
            Demo password: admin123
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <div className="space-x-4">
            <button
              onClick={syncFromEtsy}
              disabled={syncing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
            >
              {syncing ? 'Syncing...' : 'Sync from Etsy'}
            </button>
            <Link
              href="/"
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded inline-block"
            >
              Back to Site
            </Link>
          </div>
        </div>

        {loading ? (
          <p>Loading products...</p>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/20">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Price</th>
                  <th className="px-4 py-3 text-left">Quantity</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Last Synced</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-white/10">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold">{product.title}</div>
                        <div className="text-sm text-gray-400">ID: {product.etsyId}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={product.price}
                        onChange={(e) =>
                          updateProduct(product.id, { price: parseFloat(e.target.value) })
                        }
                        className="w-24 px-2 py-1 rounded bg-white/20 border border-white/30"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) =>
                          updateProduct(product.id, { quantity: parseInt(e.target.value) })
                        }
                        className="w-20 px-2 py-1 rounded bg-white/20 border border-white/30"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          product.syncStatus === 'synced'
                            ? 'bg-green-600'
                            : product.syncStatus === 'pending'
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }`}
                      >
                        {product.syncStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {product.lastSyncedAt
                        ? new Date(product.lastSyncedAt).toLocaleString()
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => syncToEtsy(product.id)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-1 px-3 rounded"
                      >
                        Push to Etsy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
