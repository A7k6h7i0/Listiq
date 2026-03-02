'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, setUser } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', avatar: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const load = async () => {
      try {
        const { data } = await authApi.getProfile();
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          avatar: data.avatar || '',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, router]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await authApi.updateProfile(form);
      setUser(data);
      toast({ title: 'Success', description: 'Profile updated' });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Update failed',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-6">Loading profile...</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-xl">
      <h1 className="text-2xl font-semibold mb-6">My Profile</h1>
      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm mb-1">Phone</label>
          <Input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm mb-1">Avatar URL</label>
          <Input value={form.avatar} onChange={(e) => setForm((s) => ({ ...s, avatar: e.target.value }))} />
        </div>
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </form>
    </div>
  );
}

