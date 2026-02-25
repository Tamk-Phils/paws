'use client';

import { useState, useEffect, useRef, use } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Send, PawPrint, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserChat() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session?.user) {
                router.push('/login');
                return;
            }
            setUser(session.user);
            initConversation(session);
        });
    }, []);

    useEffect(() => {
        if (!conversationId) return;

        console.log('Subscribing to channel for conversation:', conversationId);
        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversationId}`,
            }, (payload) => {
                setMessages((prev) => [...prev, payload.new]);
            })
            .on('system', { event: 'subscribe' }, (status) => {
                console.log('Realtime Status:', status);
                if (status === 'SUBSCRIBED') setStatus('connected');
                if (status === 'CHANNEL_ERROR') setStatus('error');
            })
            .subscribe((status) => {
                if (status === 'TIMED_OUT') setStatus('error');
            });

        return () => {
            console.log('Removing channel:', conversationId);
            supabase.removeChannel(channel);
        };
    }, [conversationId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function initConversation(session: any) {
        const userId = session.user.id;
        // Ensure the profile row exists
        await supabase.from('profiles').upsert({
            id: userId,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || null,
        }, { onConflict: 'id', ignoreDuplicates: true });

        // Find or create a conversation — use maybeSingle() to avoid 406 on zero rows
        let { data: existing } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (!existing) {
            const { data: created, error } = await supabase
                .from('conversations')
                .insert([{ user_id: userId }])
                .select()
                .maybeSingle();
            if (!error) existing = created;
        }

        if (existing) {
            setConversationId(existing.id);
            const { data: msgs } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', existing.id)
                .order('created_at', { ascending: true });
            if (msgs) setMessages(msgs);
        }
        setLoading(false);
    }

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!message.trim() || !conversationId || !user) return;
        setSending(true);
        const text = message.trim();
        setMessage('');

        const { data, error } = await supabase.from('messages').insert([{
            conversation_id: conversationId,
            sender_id: user.id,
            content: text,
        }]).select().single();

        if (error) {
            console.error('Send error:', error);
        } else if (data) {
            // Optimistic fast UI update
            setMessages((prev) => {
                // Prevent duplicate if Realtime was fast and already added it
                if (prev.find(m => m.id === data.id)) return prev;
                return [...prev, data];
            });
        }

        setSending(false);
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col px-4 py-8">
                {/* Header */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-4 p-4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                        <PawPrint className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-900">PawsomeBreed Support</h1>
                        <div className="flex items-center gap-1.5 text-green-500 text-xs font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Online — we typically reply within a few hours
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 max-h-[60vh]">
                        {messages.length === 0 && (
                            <div className="text-center py-10">
                                <PawPrint className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No messages yet. Send a message to start the conversation!</p>
                                <p className="text-gray-400 text-xs mt-1">Ask us about a listing, your application status, or anything else.</p>
                            </div>
                        )}

                        {messages.map((msg) => {
                            const isMe = msg.sender_id === user?.id;
                            return (
                                <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-auto text-white text-xs font-bold ${isMe ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`}>
                                        {isMe ? 'Me' : 'A'}
                                    </div>
                                    <div className={`max-w-md px-4 py-3 rounded-2xl text-sm ${isMe ? 'bg-[var(--color-primary)] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                                        <p>{msg.content}</p>
                                        <span className={`text-xs mt-1 block ${isMe ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-100">
                        <form onSubmit={sendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none text-sm text-black"
                            />
                            <button
                                type="submit"
                                disabled={!message.trim() || sending}
                                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 py-3 rounded-xl disabled:opacity-50 transition-colors shrink-0 flex items-center justify-center"
                            >
                                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </form>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">
                    <Link href="/browse" className="hover:text-gray-600">← Back to browsing</Link>
                </p>
            </div>
        </div>
    );
}
