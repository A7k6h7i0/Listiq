'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categoriesApi, listingsApi, locationsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';

type Category = { id: string; name: string };
type Location = { id: string; city: string; state: string };

export default function CreateListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    locationId: '',
    images: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const load = async () => {
      const [catRes, locRes] = await Promise.all([categoriesApi.getAll(), locationsApi.getAll()]);
      setCategories(catRes.data || []);
      const sortedLocations = (locRes.data || []).sort((a: Location, b: Location) => {
        if (a.state === b.state) return a.city.localeCompare(b.city);
        return a.state.localeCompare(b.state);
      });
      setLocations(sortedLocations);
    };
    load().catch(() => {
      toast({ title: 'Error', description: 'Failed to load form data', variant: 'destructive' });
    });
  }, [isAuthenticated, router, toast]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const imageUrls = form.images
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((value) => {
        try {
          const parsed = new URL(value);
          return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          return false;
        }
      });

    if (!form.categoryId || !form.locationId) {
      toast({
        title: 'Error',
        description: 'Please select both category and location',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const { data } = await listingsApi.create({
        title: form.title,
        description: form.description,
        price: Number(form.price),
        currency: 'USD',
        categoryId: form.categoryId,
        locationId: form.locationId,
        images: imageUrls,
      });

      toast({ title: 'Success', description: 'Listing created successfully' });
      router.push('/search');
    } catch (err: any) {
      const details = err.response?.data?.details as Array<{ message?: string }> | undefined;
      const detailMessage = details?.map((d) => d.message).filter(Boolean).join(', ');
      toast({
        title: 'Error',
        description: detailMessage || err.response?.data?.error || 'Failed to create listing',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Post a New Ad</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Title</label>
          <Input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            className="w-full border rounded-md p-2 min-h-32"
            value={form.description}
            onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Price (USD)</label>
          <Input
            type="number"
            value={form.price}
            onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Category</label>
          <select
            className="w-full border rounded-md p-2"
            value={form.categoryId}
            onChange={(e) => setForm((s) => ({ ...s, categoryId: e.target.value }))}
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Location</label>
          <select
            className="w-full border rounded-md p-2"
            value={form.locationId}
            onChange={(e) => setForm((s) => ({ ...s, locationId: e.target.value }))}
          >
            <option value="">Select location</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.state} - {l.city}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Image URLs (comma separated)</label>
          <Input
            value={form.images}
            onChange={(e) => setForm((s) => ({ ...s, images: e.target.value }))}
            placeholder="https://... , https://..."
          />
        </div>

        <Button type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post Ad'}</Button>
      </form>
    </div>
  );
}
