import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { withOnboardingComplete } from '../lib/auth'
import { useAuth } from '@clerk/clerk-react'
import { Send, Paperclip, ArrowLeft, MoreVertical } from 'lucide-react'
import type { Doc } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/messages/$conversationId')({
  component: withOnboardingComplete(Chat),
})

function Chat() {
  const { conversationId } = Route.useParams()
  const { userId: clerkUserId } = useAuth()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })
  const conversation = useConvexQuery(api.messages.getConversation, {
    conversationId: conversationId as any,
  })

  const messages = useConvexQuery(api.messages.getMessagesForConversation, {
    conversationId: conversationId as any,
  })

  const [newMessage, setNewMessage] = useState('')
  const [attachedImages, setAttachedImages] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sendMessage = useConvexMutation(api.messages.sendMessage)
  const markAsRead = useConvexMutation(api.messages.markMessagesAsRead)

  const otherParticipantId = conversation?.participants.find((id) => id !== currentUser?._id)
  const otherUser = useConvexQuery(api.users.getUserById, otherParticipantId ? { userId: otherParticipantId as any } : 'skip')

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight
    }
  }, [messages?.length])

  useEffect(() => {
    if (currentUser && conversation) {
      void markAsRead({
        conversationId: conversation._id,
        userId: currentUser._id,
      })
    }
  }, [conversation, currentUser, markAsRead])

  const handleSendMessage = () => {
    if ((!newMessage.trim() && attachedImages.length === 0) || !currentUser || !conversation) {
      return
    }

    void sendMessage({
      conversationId: conversation._id,
      senderId: currentUser._id,
      content: newMessage || undefined,
      images: attachedImages,
    })

    setNewMessage('')
    setAttachedImages([])
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newImages: string[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file)
        newImages.push(url)
      }
    }
    setAttachedImages([...attachedImages, ...newImages])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <div className="max-w-4xl mx-auto w-full h-full flex flex-col px-4 md:px-6 py-4">
        {/* Header */}
        <div className="card-elevated rounded-2xl px-4 py-3 mb-4 flex items-center gap-3 animate-fade-in">
          <Link to="/messages" className="p-2 hover:bg-foreground/5 rounded-xl transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Link>

          <img
            src={otherUser?.avatarUrl || '/profile-placeholder.svg'}
            alt={otherUser?.fullName ?? 'User'}
            className="w-9 h-9 rounded-xl object-cover"
          />

          <div className="flex-1">
            <h2 className="font-semibold text-sm text-foreground">
              {otherUser?.fullName || 'Loading...'}
            </h2>
          </div>

          <button className="p-2 hover:bg-foreground/5 rounded-xl transition-colors">
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Messages Area */}
        <div
          ref={messagesEndRef}
          className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1"
        >
          {!conversation || !messages ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Loading conversation...
            </div>
          ) : messages && messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No messages yet. Say hello!
            </div>
          ) : (
            <ChatMessages messages={messages} currentUserId={currentUser?._id ?? ''} />
          )}
        </div>

        {/* Composer */}
        <div className="card-elevated rounded-2xl p-3 space-y-2">
          {attachedImages.length > 0 && (
            <div className="flex gap-2 flex-wrap px-1">
              {attachedImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img}
                    alt="Upload preview"
                    className="h-14 w-14 object-cover rounded-xl"
                  />
                  <button
                    onClick={() => setAttachedImages(attachedImages.filter((_, i) => i !== idx))}
                    className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 items-end">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 hover:bg-foreground/5 rounded-xl transition-colors flex-shrink-0"
              title="Attach images"
            >
              <Paperclip className="h-5 w-5 text-muted-foreground" />
            </button>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="input-warm flex-1 text-sm"
            />

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && attachedImages.length === 0}
              className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 active:scale-95"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ChatMessagesProps {
  messages: Doc<'messages'>[]
  currentUserId: string
}

function ChatMessages({ messages, currentUserId }: ChatMessagesProps) {
  const groupedMessages = messages.reduce((groups: Record<string, Doc<'messages'>[]>, msg) => {
      const date = new Date(msg.createdAt).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(msg)
      return groups
    }, {})

  return (
    <>
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date}>
          <div className="text-center mb-4">
            <span className="bg-foreground/5 px-3 py-1 rounded-full text-xs text-muted-foreground font-medium">
              {new Date(date).toLocaleDateString([], {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="space-y-2">
            {msgs.map((message: any) => (
              <MessageBubble
                key={message._id}
                message={message}
                isOwn={message.senderId === currentUserId}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

interface MessageBubbleProps {
  message: Doc<'messages'>
  isOwn: boolean
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const isReadByOther = !isOwn && message.readBy.length > 0

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-lg'
            : 'bg-card border border-border text-foreground rounded-bl-lg'
        }`}
      >
        {message.images.length > 0 && (
          <div className="grid grid-cols-2 gap-1 mb-2">
            {message.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="Message image"
                className="rounded-xl max-w-full"
              />
            ))}
          </div>
        )}

        {message.content && (
          <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
        )}

        <div className={`flex items-center gap-1 mt-1 text-[10px] ${
          isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
        }`}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
          {isOwn && isReadByOther && <span>Read</span>}
        </div>
      </div>
    </div>
  )
}
