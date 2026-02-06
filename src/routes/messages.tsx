import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { withOnboardingComplete } from '../lib/auth'
import { useAuth } from '@clerk/clerk-react'
import { MoreVertical, Trash2, MessageSquare } from 'lucide-react'
import type { Doc } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/messages')({
  component: withOnboardingComplete(Messages),
})

function Messages() {
  const { userId: clerkUserId } = useAuth()
  const currentUser = useConvexQuery(api.users.getCurrentUser, { clerkId: clerkUserId ?? '' })
  const conversations = useConvexQuery(api.messages.listConversations, {
    userId: currentUser?._id ?? ('' as any),
  })

  return (
    <div className="min-h-screen bg-gradient-earth">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8 animate-fade-up" style={{ animationFillMode: 'both' }}>
          <h1 className="font-heading text-3xl font-bold text-foreground">Messages</h1>
          <p className="text-muted-foreground text-sm mt-1">Your conversations</p>
        </div>

        <div className="space-y-2.5 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
          {!conversations || conversations.length === 0 ? (
            <div className="card-warm rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-7 h-7 text-primary" />
              </div>
              <p className="text-muted-foreground font-medium">No conversations yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Start a conversation from a profile or service page
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <ConversationItem
                key={conversation._id}
                conversation={conversation}
                currentUserId={currentUser?._id ?? ''}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

interface ConversationItemProps {
  conversation: Doc<'conversations'>
  currentUserId: string
}

function ConversationItem({ conversation, currentUserId }: ConversationItemProps) {
  const [showActions, setShowActions] = useState(false)

  const otherParticipantId = conversation.participants.find((id) => id !== currentUserId)
  const lastMessageTime = conversation.lastMessageAt
    ? new Date(conversation.lastMessageAt).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <Link
      to="/messages/$conversationId"
      params={{ conversationId: conversation._id as string }}
      className="card-elevated rounded-2xl p-4 block relative group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-pink flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm">
            {otherParticipantId?.substring(0, 2).toUpperCase() ?? '??'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <h3 className="font-semibold text-sm text-foreground truncate">
                User {otherParticipantId?.substring(0, 8)}
              </h3>
              {lastMessageTime && (
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                  {lastMessageTime}
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground truncate">
              {conversation.lastMessage || 'No messages yet'}
            </p>
          </div>
        </div>

        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => {
              e.preventDefault()
              setShowActions(!showActions)
            }}
            className="p-2 hover:bg-foreground/5 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-8 bg-card border border-border rounded-xl shadow-lg p-1 min-w-[120px] z-10">
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-foreground/5 rounded-lg text-destructive flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
