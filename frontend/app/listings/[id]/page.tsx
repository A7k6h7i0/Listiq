'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { chatApi, favoritesApi, listingsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/store';
import { useToast } from '@/components/ui/use-toast';

type Listing = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: { url: string }[];
  location: { city: string; state: string };
  user: { id: string; name: string };
};

export default function ListingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<Listing | null>(null);
  const [showComposer, setShowComposer] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  const buildDefaultMessage = () => {
    return `Hello ${listing?.user?.name || 'Seller'}, I am interested in your listing "${listing?.title || ''}". Please let me know if it is still available. Thank you.`;
  };

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const { data } = await listingsApi.getById(id);
        setListing(data);
      } catch {
        setListing(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  const onFavorite = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      await favoritesApi.add(id);
      toast({ title: 'Saved', description: 'Added to favorites' });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.response?.data?.error || 'Could not add favorite',
        variant: 'destructive',
      });
    }
  };

  const onOpenChat = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!listing) return;

    if (user?.id === listing.user.id) {
      toast({
        title: 'Info',
        description: 'This is your own listing.',
      });
      return;
    }

    setMessage(buildDefaultMessage());
    setShowComposer(true);
  };

  const onSendMessage = async () => {
    if (!listing) return;
    if (!message.trim()) {
      toast({
        title: 'Error',
        description: 'Message cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const { data: conversation } = await chatApi.createConversation({
        listingId: listing.id,
        receiverId: listing.user.id,
      });

      await chatApi.sendMessage({
        conversationId: conversation.id,
        content: message.trim(),
      });

      toast({
        title: 'Message sent',
        description: 'Your message has been sent to the seller.',
      });
      setShowComposer(false);
      router.push('/messages');
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.response?.data?.error || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="container mx-auto px-4 py-6">Loading...</div>;
  if (!listing) return <div className="container mx-auto px-4 py-6">Listing not found.</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {listing.images?.length ? (
            listing.images.map((img, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={`${img.url}-${idx}`} src={img.url} alt={listing.title} className="w-full rounded border" />
            ))
          ) : (
            <div className="h-72 bg-muted rounded flex items-center justify-center text-muted-foreground">No image</div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{listing.title}</h1>
          <p className="text-2xl font-bold mt-2">{listing.currency} {listing.price.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">{listing.location?.city}, {listing.location?.state}</p>
          <p className="mt-4 whitespace-pre-wrap">{listing.description}</p>

          <div className="mt-6 flex gap-2">
            <Button onClick={onFavorite}>Add to Favorites</Button>
            <Button variant="outline" onClick={onOpenChat}>Chat with Seller</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Seller: {listing.user?.name}</p>

          {showComposer && (
            <div className="mt-6 border rounded-lg p-4 space-y-3">
              <h2 className="font-semibold">Contact Seller</h2>
              <div>
                <label className="block text-sm mb-1">Message</label>
                <textarea
                  className="w-full border rounded-md p-2 min-h-28"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setMessage(buildDefaultMessage())}
                >
                  Use Default Message
                </Button>
                <Button type="button" onClick={onSendMessage} disabled={sending}>
                  {sending ? 'Sending...' : 'Send Message'}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowComposer(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
