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
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-2rem)]">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="mb-4 border-b pb-4 flex items-center gap-4">
          <Link to="/messages" className="p-2 hover:bg-muted rounded-md">
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="flex-1">
            <h2 className="text-xl font-semibold">
              {otherParticipantId ? `User ${otherParticipantId.substring(0, 8)}` : 'Unknown'}
            </h2>
          </div>

          <button className="p-2 hover:bg-muted rounded-md">
            <MoreVertical className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div
          ref={messagesEndRef}
          className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2"
        >
          {!conversation || !messages ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading conversation...
            </div>
          ) : messages && messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet. Say hello!
            </div>
          ) : (
            <ChatMessages messages={messages} currentUserId={currentUser?._id ?? ''} />
          )}
        </div>

        <div className="border-t pt-4 space-y-3">
          {attachedImages.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {attachedImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img}
                    alt="Upload preview"
                    className="h-16 w-16 object-cover rounded-md"
                  />
                  <button
                    onClick={() => setAttachedImages(attachedImages.filter((_, i) => i !== idx))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
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
              className="p-2 hover:bg-muted rounded-md"
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
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && attachedImages.length === 0}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send
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
            <span className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
              {new Date(date).toLocaleDateString([], {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="space-y-3">
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
        className={`max-w-[70%] rounded-lg p-3 ${
          isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        }`}
      >
        {message.images.length > 0 && (
          <div className="grid grid-cols-2 gap-1 mb-2">
            {message.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="Message image"
                className="rounded-md max-w-full"
              />
            ))}
          </div>
        )}

        {message.content && (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}

        <div className={`flex items-center gap-1 mt-1 text-xs ${
          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
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
