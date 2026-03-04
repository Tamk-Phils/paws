'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Send, User, Loader2, Trash2 } from 'lucide-react';
import { adminSupabase } from '@/lib/supabaseClient';

export default function AdminChat() {
    const searchParams = useSearchParams();
    const targetUserId = searchParams.get('user');

    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [adminUser, setAdminUser] = useState<any>(null);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [showNewChatSearch, setShowNewChatSearch] = useState(false);
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
                lastMessage: c.messages?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0],
            }));
            setConversations(enriched);

            // If targetUserId is provided, handle it — pass enriched directly to avoid stale state
            if (targetUserId) {
                await startOrJoinConversation(targetUserId, enriched);
            } else if (!activeConvId && enriched.length > 0) {
                setActiveConvId(enriched[0].id);
            }
        }
        setLoading(false);
    }

    async function startOrJoinConversation(userId: string, existingConvs?: any[]) {
        // Use provided list (fresh from fetch) or fall back to state
        const convList = existingConvs ?? conversations;
        const existing = convList.find((c: any) => c.user_id === userId);
        if (existing) {
            setActiveConvId(existing.id);
            setShowNewChatSearch(false);
        } else {
            // Create new
            const { data: newConv, error } = await adminSupabase
                .from('conversations')
                .insert([{ user_id: userId }])
                .select()
                .single();
            if (!error && newConv) {
                await fetchConversations(); // Refresh list
                setActiveConvId(newConv.id);
                setShowNewChatSearch(false);
            }
        }
    }

    async function searchUsers(term: string) {
        setUserSearchTerm(term);
        if (term.length < 2) {
            setAllUsers([]);
            return;
        }
        const { data } = await adminSupabase
            .from('profiles')
            .select('*')
            .or(`full_name.ilike.%${term}%,email.ilike.%${term}%`)
            .limit(5);
        if (data) setAllUsers(data);
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
            setMessages(prev => [...prev, data]);

            // Database notification
            const conv = conversations.find(c => c.id === activeConvId);
            if (conv?.user_id) {
                await adminSupabase.from('notifications').insert([{
                    user_id: conv.user_id,
                    title: '💬 New Message from Admin',
                    message: `Admin replied: "${text.slice(0, 60)}${text.length > 60 ? '...' : ''}"`,
                    type: 'message',
                }]);

                // Also send Push Notification
                fetch('/api/push/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: conv.user_id,
                        title: '💬 New Message from Admin',
                        message: text.slice(0, 100),
                        url: '/chat'
                    })
                }).catch(err => console.error('Push notify error:', err));
            }
        }
    }

    async function deleteConversation(e: React.MouseEvent, convId: string) {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this conversation?')) return;

        const { error } = await adminSupabase.from('conversations').delete().eq('id', convId);
        if (!error) {
            setConversations(prev => prev.filter(c => c.id !== convId));
            if (activeConvId === convId) setActiveConvId(null);
        }
    }

    const activeConv = conversations.find(c => c.id === activeConvId);

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col p-4">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <h1 className="text-3xl font-extrabold text-gray-900">Messages</h1>
                <span className="text-sm text-gray-500">{conversations.length} total</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-grow flex overflow-hidden">
                {/* Sidebar */}
                <div className={`border-r border-gray-100 bg-gray-50 w-full md:w-80 ${activeConvId ? 'hidden md:flex' : 'flex'} flex-col`}>
                    <div className="p-4 border-b border-gray-100 flex flex-col gap-3">
                        <button
                            onClick={() => setShowNewChatSearch(!showNewChatSearch)}
                            className="w-full py-2 bg-[var(--color-primary)] text-white text-sm font-bold rounded-lg hover:bg-[var(--color-primary-hover)] transition flex items-center justify-center gap-2"
                        >
                            {showNewChatSearch ? 'Cancel' : 'New Message'}
                        </button>

                        {showNewChatSearch ? (
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={userSearchTerm}
                                    onChange={(e) => searchUsers(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-sm"
                                    autoFocus
                                />
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                {allUsers.length > 0 && (
                                    <div className="absolute top-11 left-0 right-0 bg-white border border-gray-100 rounded-lg shadow-xl z-20 overflow-hidden">
                                        {allUsers.map(u => (
                                            <div
                                                key={u.id}
                                                onClick={() => startOrJoinConversation(u.id)}
                                                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                                            >
                                                <div className="font-bold text-gray-900 text-sm">{u.full_name}</div>
                                                <div className="text-xs text-gray-500">{u.email}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="relative">
                                <input type="text" placeholder="Search conversations..." className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:bg-white focus:outline-none transition-all text-sm" />
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.map((c) => (
                            <div
                                key={c.id}
                                onClick={() => setActiveConvId(c.id)}
                                className={`p-4 border-b border-gray-50 cursor-pointer relative group ${c.id === activeConvId ? 'bg-white border-l-4 border-l-[var(--color-primary)]' : 'hover:bg-gray-100 border-l-4 border-l-transparent'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-gray-900 truncate">{c.profiles?.full_name || 'User'}</span>
                                    <button onClick={(e) => deleteConversation(e, c.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                <p className="text-xs text-gray-500 truncate mt-1">{c.lastMessage?.content || 'No messages'}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat */}
                <div className={`flex-1 flex flex-col ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
                    {activeConvId ? (
                        <>
                            <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white">
                                <button onClick={() => setActiveConvId(null)} className="md:hidden text-gray-500">←</button>
                                <User className="w-8 h-8 p-1.5 bg-gray-100 rounded-full text-gray-500" />
                                <div>
                                    <h2 className="font-bold text-gray-900">{activeConv?.profiles?.full_name || 'User'}</h2>
                                    <p className="text-xs text-gray-400">{activeConv?.profiles?.email}</p>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                                {messages.map((m) => {
                                    const isAdmin = m.sender_id === adminUser?.id;
                                    return (
                                        <div key={m.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isAdmin ? 'bg-[var(--color-primary)] text-white' : 'bg-white border border-gray-100 text-gray-800'}`}>
                                                {m.content}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>
                            <form onSubmit={sendAdminMessage} className="p-4 border-t border-gray-100 bg-white flex gap-2">
                                <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-gray-50 border-none rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-[var(--color-primary)]" />
                                <button type="submit" disabled={!message.trim()} className="p-2.5 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)]"><Send className="w-5 h-5" /></button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">Select a user to start chatting</div>
                    )}
                </div>
            </div>
        </div>
    );
}
