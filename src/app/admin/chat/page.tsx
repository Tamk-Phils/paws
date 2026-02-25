'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Send, User, Loader2, Trash2 } from 'lucide-react';
import { adminSupabase } from '@/lib/supabaseClient';

export default function AdminChat() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [adminUser, setAdminUser] = useState<any>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        adminSupabase.auth.getSession().then(({ data: { session } }) => {
            setAdminUser(session?.user ?? null);
        });
        fetchConversations();

        // Subscribe to new messages across all conversations
        const channel = adminSupabase
            .channel('admin-messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => {
                fetchConversations();
                if (activeConvId) fetchMessages(activeConvId);
            })
            .subscribe();
        return () => { adminSupabase.removeChannel(channel); };
    }, []);

    useEffect(() => {
        if (activeConvId) fetchMessages(activeConvId);
    }, [activeConvId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function fetchConversations() {
        const { data } = await adminSupabase
            .from('conversations')
            .select('*, profiles!conversations_user_id_fkey(full_name, email, avatar_url), messages(content, created_at, sender_id)')
            .order('created_at', { ascending: false });
        if (data) {
            const enriched = data.map(c => ({
                ...c,
                lastMessage: c.messages?.sort((a: any, b: any) => new Date(b.created_at).getTime()-new Date(a.created_at).getTime())[0],
            }));
            setConversations(enriched);
            if (!activeConvId && enriched.length > 0) setActiveConvId(enriched[0].id);
            else if (activeConvId && !enriched.some(c => c.id === activeConvId)) {
                // If active conversation was deleted, set a new active one or null
                setActiveConvId(enriched.length > 0 ? enriched[0].id : null);
            }
        }
        setLoading(false);
    }

    async function fetchMessages(convId: string) {
        const { data } = await adminSupabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true });
        if (data) setMessages(data);
    }

    async function sendAdminMessage(e: React.FormEvent) {
        e.preventDefault();
        if (!message.trim() || !activeConvId || !adminUser) return;
        const text = message.trim();
        setMessage('');

        const { data, error } = await adminSupabase.from('messages').insert([{
            conversation_id: activeConvId,
            sender_id: adminUser.id,
            content: text,
        }]).select().single();

        if (!error && data) {
            // Optimistic fast UI update
            setMessages(prev => {
                if (prev.find(m => m.id === data.id)) return prev;
                return [...prev, data];
            });

            // Send back-end push notification to user
            const conv = conversations.find(c => c.id === activeConvId);
            if (conv?.user_id) {
                await adminSupabase.from('notifications').insert([{
                    user_id: conv.user_id,
                    title: '💬 New Message from Admin',
                    message: `Admin replied: "${text.slice(0, 60)}${text.length > 60 ? '...' : ''}"`,
                    type: 'message',
                }]);
            }
        }
    }

    async function deleteConversation(e: React.MouseEvent, convId: string) {
        e.stopPropagation(); // Prevent activating the conversation
        if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
            return;
        }

        const { error } = await adminSupabase
            .from('conversations')
            .delete()
            .eq('id', convId);

        if (error) {
            console.error('Error deleting conversation:', error);
            alert('Failed to delete conversation.');
        } else {
            setConversations(prev => {
                const updatedConversations = prev.filter(conv => conv.id !== convId);
                if (activeConvId === convId) {
                    setActiveConvId(updatedConversations.length > 0 ? updatedConversations[0].id : null);
                }
                return updatedConversations;
            });
        }
    }

    const activeConv = conversations.find(c => c.id === activeConvId);

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <h1 className="text-3xl font-extrabold text-gray-900">Messages</h1>
                {conversations.length > 0 && (
                    <span className="text-sm text-gray-500">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</span>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-grow flex overflow-hidden">

                {/* Sidebar */}
                <div className={`border-r border-gray-100 bg-gray-50/30 flex-col w-full md:w-80 ${activeConvId ? 'hidden md:flex' : 'flex'} `}>
                    <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                            <input type="text" placeholder="Search messages..." className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm transition-colors" />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
                        ) : conversations.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">No conversations yet</div>
                        ) : (
                            conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => setActiveConvId(conv.id)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors relative group ${conv.id === activeConvId ? 'bg-white border-l-4 border-l-[var(--color-primary)]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'} `}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-semibold text-gray-900 truncate pr-8">{conv.profiles?.full_name || conv.profiles?.email || 'Unknown User'}</span>
                                        {conv.lastMessage && (
                                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{new Date(conv.lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate pr-8">{conv.lastMessage?.content || 'No messages yet'}</p>
                                    <button
                                        onClick={(e) => deleteConversation(e, conv.id)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-md"
                                        title="Delete Conversation"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex-col bg-white ${!activeConvId ? 'hidden md:flex' : 'flex'} `}>
                    {!activeConvId ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            <p>Select a conversation to view messages</p>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="h-16 border-b border-gray-100 flex items-center px-4 md:px-6 justify-between shrink-0 bg-white">
                                <div className="flex items-center gap-3">
                                    <button
                                        className="md:hidden p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                                        onClick={() => setActiveConvId(null)}
                                    >
                                        <span className="font-medium mr-1 text-lg">←</span>
                                    </button>
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="font-bold text-gray-900 truncate">{activeConv?.profiles?.full_name || activeConv?.profiles?.email || 'User'}</h2>
                                        <p className="text-xs text-gray-400 truncate">{activeConv?.profiles?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                                {messages.length === 0 ? (
                                    <div className="text-center text-gray-400 text-sm py-12">No messages yet in this conversation</div>
                                ) : (
                                    messages.map((msg) => {
                                        const isAdmin = msg.sender_id === adminUser?.id;
                                        return (
                                            <div key={msg.id} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''} `}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-auto ${isAdmin ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-200 text-gray-500'} `}>
                                                    {isAdmin ? 'A' : <User className="w-4 h-4" />}
                                                </div>
                                                <div className={`max-w-md p-4 rounded-2xl text-sm shadow-sm ${isAdmin ? 'bg-[var(--color-primary)] text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'} `}>
                                                    <p>{msg.content}</p>
                                                    <span className={`text-xs mt-1 block ${isAdmin ? 'text-white/60 text-right' : 'text-gray-400'} `}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={bottomRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-gray-100 bg-white shrink-0">
                                <form onSubmit={sendAdminMessage} className="flex items-end gap-2">
                                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:border-transparent transition-all">
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAdminMessage(e as any); } }}
                                            placeholder="Type your reply..."
                                            className="w-full bg-transparent p-3 outline-none resize-none max-h-32 min-h-[52px] text-sm text-gray-900"
                                            rows={1}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!message.trim()}
                                        className="p-3 bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg flex items-center justify-center shrink-0 shadow-sm"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
