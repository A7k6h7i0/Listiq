'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { categoriesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Search,
  ShieldCheck,
  Zap,
  BadgeIndianRupee,
  Smartphone,
  Headphones,
  Car,
  Wrench,
  Bike,
  Building2,
  Home,
  Tv,
  Laptop,
  Sofa,
  Lamp,
  Shirt,
  BookOpen,
  PawPrint,
  Handshake,
  Briefcase,
  Factory,
  Wheat,
  LucideIcon,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

const categoryVisuals: Record<string, { icon: LucideIcon; bg: string }> = {
  mobiles: { icon: Smartphone, bg: 'from-cyan-100 to-blue-100' },
  'mobile-accessories': { icon: Headphones, bg: 'from-indigo-100 to-sky-100' },
  cars: { icon: Car, bg: 'from-orange-100 to-amber-100' },
  'car-accessories': { icon: Wrench, bg: 'from-zinc-100 to-slate-100' },
  motorcycles: { icon: Bike, bg: 'from-red-100 to-rose-100' },
  scooters: { icon: Bike, bg: 'from-teal-100 to-emerald-100' },
  'properties-sale': { icon: Home, bg: 'from-green-100 to-lime-100' },
  'properties-rent': { icon: Building2, bg: 'from-violet-100 to-fuchsia-100' },
  'electronics-appliances': { icon: Tv, bg: 'from-blue-100 to-indigo-100' },
  'computers-laptops': { icon: Laptop, bg: 'from-slate-100 to-zinc-100' },
  'tvs-video-audio': { icon: Tv, bg: 'from-pink-100 to-rose-100' },
  furniture: { icon: Sofa, bg: 'from-yellow-100 to-amber-100' },
  'home-decor-garden': { icon: Lamp, bg: 'from-lime-100 to-emerald-100' },
  fashion: { icon: Shirt, bg: 'from-fuchsia-100 to-pink-100' },
  'books-sports-hobbies': { icon: BookOpen, bg: 'from-purple-100 to-indigo-100' },
  bicycles: { icon: Bike, bg: 'from-sky-100 to-cyan-100' },
  pets: { icon: PawPrint, bg: 'from-amber-100 to-orange-100' },
  services: { icon: Handshake, bg: 'from-gray-100 to-slate-100' },
  jobs: { icon: Briefcase, bg: 'from-emerald-100 to-green-100' },
  'business-industrial': { icon: Factory, bg: 'from-stone-100 to-zinc-100' },
  agriculture: { icon: Wheat, bg: 'from-lime-100 to-yellow-100' },
};

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesRes = await categoriesApi.getAll();
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div>
      <section className="bg-gradient-to-b from-blue-50 via-sky-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Buy and Sell Near You</h1>
            <p className="text-lg text-muted-foreground">
              Discover trusted local deals across categories in minutes.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for items, categories, and services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button type="submit" size="lg">
                Search
              </Button>
            </div>
          </form>

          <div className="mt-8 flex justify-center gap-4">
            <Link href="/search">
              <Button variant="outline" size="lg">
                Browse All
              </Button>
            </Link>
            <Link href="/listings/create">
              <Button size="lg">Post an Ad</Button>
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
            <div className="rounded-xl border bg-white p-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <p className="text-sm">Verified profiles and safer interactions</p>
            </div>
            <div className="rounded-xl border bg-white p-4 flex items-center gap-3">
              <Zap className="h-5 w-5 text-orange-600" />
              <p className="text-sm">Instant posting and quick buyer discovery</p>
            </div>
            <div className="rounded-xl border bg-white p-4 flex items-center gap-3">
              <BadgeIndianRupee className="h-5 w-5 text-blue-700" />
              <p className="text-sm">Local deals from all over India</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Browse Categories</h2>
          {loadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, idx) => (
                <div key={idx} className="h-28 rounded-xl border bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const visual = categoryVisuals[category.slug] || {
                  icon: Search,
                  bg: 'from-gray-100 to-slate-100',
                };
                const Icon = visual.icon;

                return (
                  <Link
                    key={category.id}
                    href={`/search?categoryId=${category.id}`}
                    className="border rounded-xl overflow-hidden hover:border-primary hover:shadow-md transition bg-white"
                  >
                    <div className={`h-20 bg-gradient-to-r ${visual.bg} flex items-center justify-center`}>
                      <Icon className="h-8 w-8 text-slate-700" />
                    </div>
                    <div className="p-3">
                      <div className="font-medium text-sm text-center leading-snug">{category.name}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Start Selling Today</h2>
          <p className="text-lg mb-8 opacity-90">
            Reach genuine buyers in your city. Posting takes less than 2 minutes.
          </p>
          <Link href="/listings/create">
            <Button size="lg" variant="secondary">
              Post Your First Ad
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

