'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { favoritesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

type FavoriteItem = {
  id: string;
  listing: {
    id: string;
    title: string;
    price: number;
    currency: string;
    images: { url: string }[];
    location: { city: string; state: string };
  };
};

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState<FavoriteItem[]>([]);

  const loadFavorites = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await favoritesApi.getAll();
      setItems(data.favorites || []);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadFavorites();
  }, [isAuthenticated, router]);

  const onRemove = async (listingId: string) => {
    await favoritesApi.remove(listingId);
    setItems((prev) => prev.filter((i) => i.listing.id !== listingId));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Favorites</h1>
      {loading && <p>Loading favorites...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && items.length === 0 && <p>No favorites yet.</p>}
      <div className="space-y-3">
        {items.map((fav) => (
          <div key={fav.id} className="border rounded-lg p-4 flex items-center justify-between gap-3">
            <Link href={`/listings/${fav.listing.id}`} className="min-w-0">
              <p className="font-medium truncate">{fav.listing.title}</p>
              <p className="text-sm text-muted-foreground">
                {fav.listing.currency} {fav.listing.price.toLocaleString()} - {fav.listing.location?.city}, {fav.listing.location?.state}
              </p>
            </Link>
            <Button variant="outline" onClick={() => onRemove(fav.listing.id)}>Remove</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

