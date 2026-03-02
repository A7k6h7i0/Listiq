'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { listingsApi } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Listing = {
  id: string;
  title: string;
  price: number;
  currency: string;
  createdAt: string;
  images: { url: string }[];
  location: { city: string; state: string };
  category: { name: string };
};

function SearchContent() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);

  const queryParams = useMemo(
    () => ({
      q: params.get('q') || undefined,
      categoryId: params.get('categoryId') || undefined,
      minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
      maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
      sortBy: params.get('sortBy') || 'newest',
      page: Number(params.get('page') || '1'),
      limit: 20,
    }),
    [params]
  );

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await listingsApi.search(queryParams);
        setListings(data.listings || []);
      } catch (e: any) {
        setError(e.response?.data?.error || 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [queryParams]);

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const next = q.trim();
    window.location.href = next ? `/search?q=${encodeURIComponent(next)}` : '/search';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Browse Listings</h1>
      <form onSubmit={onSearch} className="flex gap-2 mb-6">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title or description" />
        <Button type="submit">Search</Button>
      </form>

      {loading && <p>Loading listings...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && listings.length === 0 && <p>No listings found.</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <Link key={listing.id} href={`/listings/${listing.id}`} className="border rounded-lg p-4 hover:shadow-md">
            <div className="aspect-video rounded bg-muted mb-3 overflow-hidden">
              {listing.images?.[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={listing.images[0].url} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">No image</div>
              )}
            </div>
            <p className="text-lg font-semibold">{listing.currency} {listing.price.toLocaleString()}</p>
            <p className="font-medium truncate">{listing.title}</p>
            <p className="text-sm text-muted-foreground">{listing.location?.city}, {listing.location?.state}</p>
            <p className="text-xs text-muted-foreground mt-1">{listing.category?.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-6">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
