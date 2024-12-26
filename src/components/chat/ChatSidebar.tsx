/**
 * @dev Chat sidebar component that manages chat history and navigation
 * Features: chat list, collapsible sidebar, chat title editing, chat deletion
 */

'use client';

import { useSession, signOut } from 'next-auth/react';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, LogOutIcon, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * @dev Defines the structure for a chat session
 */
interface Chat {
  _id: string;
  title: string;
  messages: any[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * @dev Props for the ChatSidebar component
 */
interface ChatSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function ChatSidebar({ isCollapsed, onToggle }: ChatSidebarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [chats, setChats] = useState<Chat[]>([]);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  
  useEffect(() => {
    fetchChats();
    
    // Listen for chat updates
    const handleChatUpdate = () => {
      fetchChats();
    };
    
    window.addEventListener('chatUpdated', handleChatUpdate);
    return () => window.removeEventListener('chatUpdated', handleChatUpdate);
  }, []);

  /**
   * @dev Fetches all chats for the current user
   */
  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats');
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    }
  };

  /**
   * @dev Creates a new chat session and redirects to it
   */
  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' })
      });
      
      if (response.ok) {
        const newChat = await response.json();
        setChats(prev => [newChat, ...prev]);
        router.push(`/dashboard?chatId=${newChat._id}`);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  /**
   * @dev Initiates chat title editing mode
   * @param chat - Chat object containing current title
   */
  const startEditing = (chat: Chat) => {
    setEditingChatId(chat._id);
    setEditTitle(chat.title);
  };

  /**
   * @dev Saves the edited chat title
   * @param chatId - ID of the chat being edited
   */
  const updateChatTitle = async (chatId: string) => {
    if (!editTitle.trim()) {
      setEditingChatId(null);
      return;
    }

    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim() })
      });

      if (response.ok) {
        setChats(prev => prev.map(chat => 
          chat._id === chatId ? { ...chat, title: editTitle.trim() } : chat
        ));
      }
    } catch (error) {
      console.error('Failed to update chat title:', error);
    }
    setEditingChatId(null);
  };

  /**
   * @dev Deletes a chat session
   * @param chatId - ID of the chat to delete
   */
  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setChats(prev => prev.filter(chat => chat._id !== chatId));
        if (searchParams.get('chatId') === chatId) {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  /**
   * @dev Handles user sign out and redirects to home page
   */
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <aside className={cn(
      "relative border-r bg-white transition-all duration-300 flex flex-col h-screen",
      isCollapsed ? "w-[40px]" : "w-64"
    )}>
      {/* Collapse Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-3 z-10 rounded-full border bg-white p-1 hover:bg-gray-50 shadow-sm"
      >
        {isCollapsed ? (
          <ChevronRightIcon size={16} />
        ) : (
          <ChevronLeftIcon size={16} />
        )}
      </button>

      <div className={cn(
        "flex-1 overflow-hidden transition-opacity duration-300",
        isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
      )}>
        <div className="p-4">
          <button 
            onClick={createNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 p-2 text-sm text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
          >
            <PlusIcon size={16} />
            New Chat
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {chats.map((chat) => (
            <div
              key={chat._id}
              className={cn(
                "group flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-gray-50",
                pathname === '/dashboard' && searchParams.get('chatId') === chat._id && "bg-gray-50"
              )}
            >
              {editingChatId === chat._id ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => updateChatTitle(chat._id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      updateChatTitle(chat._id);
                    } else if (e.key === 'Escape') {
                      setEditingChatId(null);
                    }
                  }}
                  className="flex-1 bg-white rounded px-2 py-1 border focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              ) : (
                <>
                  <button
                    onClick={() => router.push(`/dashboard?chatId=${chat._id}`)}
                    className="flex-1 truncate text-left"
                  >
                    <div className="font-medium">
                      {chat.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(chat.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(chat);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Pencil size={14} className="text-gray-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat._id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Trash2 size={14} className="text-gray-500" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Sign Out Button */}
      <div className={cn(
        "p-2 border-t transition-opacity duration-300",
        isCollapsed ? "opacity-0 invisible" : "opacity-100 visible"
      )}>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg p-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          <LogOutIcon size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
