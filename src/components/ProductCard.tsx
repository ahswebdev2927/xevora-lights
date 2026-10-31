"use client";

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { usePathname } from 'next/navigation';
import HoverImageCarousel from './HoverImageCarousel';

interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  basePrice?: number;
  salePrice?: number;
  imageUrl: string;
  images?: string[];
  categorySlug: string;
  isCustomizable?: boolean;
  style?: string | null;
  neckStyle?: string | null;
  keyWords?: string | null;
  avgRating?: number | string | null;
  numReviews?: number | string | null;
  totalStock?: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const basePrice = product.basePrice ?? product.price ?? 0;
  const salePrice = product.salePrice ?? product.price ?? 0;
  
  // Active price to display
  const activePrice = salePrice > 0 && salePrice < basePrice ? salePrice : basePrice;
  const originalPrice = basePrice;
  
  // Calculate discount percentage automatically
  const discount = originalPrice > 0 && activePrice < originalPrice
    ? Math.round(((originalPrice - activePrice) / originalPrice) * 100)
    : 0;

  const pathname = usePathname();
  const isWishlisted = useWishlistStore((state) => state.items.some((item) => item.productId === Number(product.id)));
  const addItem = useWishlistStore((state) => state.addItem);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const isAuthenticated = useWishlistStore((state) => state.isAuthenticated);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
      return;
    }

    if (isWishlisted) {
      await removeItem(Number(product.id));
    } else {
      await addItem(Number(product.id));
    }
  };

  return (
    <Link 
      href={`/product/${product.id}`} 
      className="group flex flex-col w-full bg-transparent transition-all duration-300 overflow-hidden"
    >
      {/* Top Image Section */}
      <div className="relative w-full aspect-square overflow-hidden bg-brand-light/50 rounded-2xl border border-black/5">
        <HoverImageCarousel 
          images={product.images || []}
          defaultImage={product.imageUrl || "/images/placeholder.png"}
          alt={product.name}
          className="transform group-hover:scale-105 transition-transform duration-700" 
        />

        {/* Right Badge (Sold out takes priority) */}
        {product.totalStock !== undefined && product.totalStock <= 0 ? (
          <div className="absolute top-3 right-3 z-30 bg-black/80 text-white text-[9px] font-black px-2 py-1 rounded shadow-md uppercase tracking-wider">
            Sold out
          </div>
        ) : (
          discount > 0 && (
            <div className="absolute top-3 right-3 z-30 bg-[#4c0519] text-white text-[9px] font-black px-2 py-1 rounded shadow-md uppercase tracking-wider">
              -{discount}% OFF
            </div>
          )
        )}
      </div>
      
      {/* Bottom Content Section */}
      <div className="pt-3 pb-2 px-1 flex flex-col flex-1 items-start">
        {/* Product Name */}
        <h3 className="text-xs md:text-sm font-medium text-black/85 text-left line-clamp-2 mb-1 w-full leading-tight">
          {product.name}
        </h3>
        
        {/* Pricing Block */}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs md:text-sm font-bold text-black/90">
            Rs. {activePrice.toFixed(2)}
          </span>
          {discount > 0 && (
            <span className="text-[10px] md:text-xs text-black/40 line-through">
              Rs. {originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
