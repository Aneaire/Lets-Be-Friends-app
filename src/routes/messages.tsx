import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery as useConvexQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { withOnboardingComplete } from '../lib/auth'
import { useAuth } from '@clerk/clerk-react'
import { MoreVertical, Trash2 } from 'lucide-react'
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        <div className="space-y-2">
          {!conversations || conversations.length === 0 ? (
            <div className="bg-card border rounded-lg p-12 text-center">
              <p className="text-muted-foreground">No conversations yet.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start a conversation from a profile or service page.
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
      className="block bg-card border rounded-lg p-4 hover:border-primary/50 transition-colors relative"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 flex items-start gap-3 min-w-0">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold flex-shrink-0">
            {otherParticipantId?.substring(0, 2) ?? '??'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold truncate">
                User {otherParticipantId?.substring(0, 8)}
              </h3>
              {lastMessageTime && (
                <span className="text-xs text-muted-foreground flex-shrink-0">
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
            className="p-2 hover:bg-muted rounded-md"
          >
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </button>

          {showActions && (
            <div className="absolute right-0 top-8 bg-card border rounded-md shadow-lg p-1 min-w-[120px] z-10">
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded text-red-600 flex items-center gap-2">
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
