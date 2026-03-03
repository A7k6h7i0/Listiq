'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chatApi } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Conversation = {
  id: string;
  updatedAt: string;
  unreadCount?: number;
  listing: { id: string; title: string; images?: { url: string }[] };
  buyer: { id: string; name: string };
  seller: { id: string; name: string };
  messages: { id: string; senderId: string; content: string; createdAt: string }[];
};

export default function MessagesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const loadConversations = async () => {
    try {
      const { data } = await chatApi.getConversations();
      const list = (data || []) as Conversation[];
      setConversations(list);
      if (!selectedConversationId && list.length > 0) {
        setSelectedConversationId(list[0].id);
      }
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load conversations');
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const { data } = await chatApi.getConversation(conversationId);
      setSelectedConversation(data);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load conversation');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const run = async () => {
      setLoading(true);
      setError('');
      await loadConversations();
      setLoading(false);
    };
    run();
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!selectedConversationId) return;
    loadConversation(selectedConversationId);
    const interval = setInterval(() => {
      loadConversation(selectedConversationId);
      loadConversations();
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedConversationId]);

  const onSend = async () => {
    if (!selectedConversationId || !message.trim()) return;
    setSending(true);
    try {
      const { data } = await chatApi.sendMessage({
        conversationId: selectedConversationId,
        content: message.trim(),
      });

      setSelectedConversation((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...(prev.messages || []), data],
        };
      });
      setMessage('');
      await loadConversations();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleString();

  const otherParty =
    selectedConversation && user
      ? selectedConversation.buyer.id === user.id
        ? selectedConversation.seller
        : selectedConversation.buyer
      : null;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">Messages</h1>
      {loading && <p>Loading conversations...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && conversations.length === 0 && <p>No conversations yet.</p>}

      {!loading && conversations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-2 md:col-span-1 max-h-[70vh] overflow-auto">
            {conversations.map((c) => (
              <button
                key={c.id}
                className={`w-full text-left p-3 rounded-md border mb-2 ${selectedConversationId === c.id ? 'bg-muted' : ''}`}
                onClick={() => setSelectedConversationId(c.id)}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium truncate">{c.listing.title}</p>
                  {!!c.unreadCount && (
                    <span className="min-w-6 h-6 px-2 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {c.messages?.[0]?.content || 'No messages yet'}
                </p>
              </button>
            ))}
          </div>

          <div className="border rounded-lg p-4 md:col-span-2 flex flex-col min-h-[70vh]">
            {!selectedConversation && <p>Select a conversation.</p>}
            {selectedConversation && (
              <>
                <div className="border-b pb-3 mb-3">
                  <p className="font-semibold">{selectedConversation.listing.title}</p>
                  <p className="text-sm text-muted-foreground">Chat with {otherParty?.name}</p>
                </div>

                <div className="flex-1 overflow-auto space-y-3 pr-1">
                  {selectedConversation.messages?.map((m, idx) => {
                    const mine = m.senderId === user?.id;
                    return (
                      <div key={`${m.id || idx}-${m.createdAt}`} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-lg p-3 ${mine ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                          <p className="text-[10px] mt-1 opacity-80">{formatTime(m.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 mt-3 border-t flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        onSend();
                      }
                    }}
                  />
                  <Button onClick={onSend} disabled={sending || !message.trim()}>
                    {sending ? 'Sending...' : 'Send'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
