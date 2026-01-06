import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import Link from 'next/link';

export const revalidate = 3600; // Revalidate every hour

async function getProducts() {
  const products = await prisma.product.findMany({
    where: {
      state: 'active',
    },
    include: {
      images: {
        orderBy: {
          rank: 'asc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return products;
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Products</h1>
          <p className="text-xl text-gray-400">
            Discover unique items from Dappled Specter Co.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">
              No products available at the moment.
            </p>
            <p className="text-gray-500 mt-2">
              Check back soon or visit our{' '}
              <Link
                href="https://www.etsy.com/shop/dappledspecterco"
                className="text-purple-400 hover:text-purple-300"
                target="_blank"
              >
                Etsy shop
              </Link>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300"
              >
                {product.images[0] ? (
                  <div className="relative h-64 w-full">
                    <Image
                      src={product.images[0].url}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-64 w-full bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}

                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{product.title}</h2>

                  {product.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {product.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-purple-400">
                      ${product.price.toFixed(2)}
                    </span>
                    <span
                      className={`text-sm ${
                        product.quantity > 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {product.quantity > 0
                        ? `${product.quantity} in stock`
                        : 'Out of stock'}
                    </span>
                  </div>

                  {product.url && (
                    <Link
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
                    >
                      View on Etsy
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <Link
          href="/"
          className="text-purple-400 hover:text-purple-300 font-semibold"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
