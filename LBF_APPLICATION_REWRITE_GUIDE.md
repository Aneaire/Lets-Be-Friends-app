# LBF Application Rewrite Guide

## Overview

**LBF (Let's Be Friends)** is a social marketplace platform designed for connecting people, offering companionship services, and building meaningful friendships through a comprehensive web application.

**Goal:** Rewrite this application using modern technologies with a fresh architectural approach. The AI agent should **not** blindly follow the existing structure, but rather design an optimal architecture based on best practices for the new tech stack.

---

## Tech Stack

### Current Stack
- **Frontend:** React 19, TanStack Router, Vite, Tailwind CSS, shadcn/ui, Zustand
- **Backend:** Hono (Bun runtime), Drizzle ORM, Supabase (Auth + PostgreSQL)
- **Realtime:** Supabase Realtime
- **Payment:** PayMongo integration
- **Package Manager:** Bun

### Target Stack (New Architecture)
- **Framework:** TanStack Start (React framework with SSR/SSG support)
- **Backend/Database:** Convex (real-time database + backend functions)
- **Authentication:** Clerk (auth provider)
- **UI Library:** shadcn/ui + Tailwind CSS
- **Forms:** TanStack Form
- **State Management:** Consider TanStack Query (for server state) + appropriate client state solution
- **Package Manager:** Bun (recommended) or pnpm

---

## Core Functionality & Features

### 1. Authentication & User Management

#### What the App Does
- User registration and authentication
- Profile management with rich information
- Location-based discovery with privacy controls
- Verified user badges

#### Key Features
- **Profile Creation:** Users create profiles with:
  - Full name, username (unique), email
  - Avatar photo
  - Bio/description
  - Phone number
  - Birthday and gender
  - Location (city/province in the Philippines)
  - Verification status

- **Location Privacy:**
  - Users can enable/disable location visibility
  - Location can be auto-detected from browser geolocation
  - Location mapped to predefined cities/provinces (315+ locations)
  - Search radius filtering (1-50km)

- **User Verification:**
  - Verified badges for trusted users
  - Admin verification process

### 2. Social Features

#### Posts & Content Sharing
- Users can create posts with:
  - Caption (up to 2000 characters)
  - Multiple images (up to 10)
  - Tags (up to 20)
  - Location tagging
- Post interactions:
  - Like/unlike posts
  - Comment on posts (with nested replies)
  - Save/bookmark posts
  - Share posts
- Feed of posts from followed users and discover section

#### Comments System
- Nested comment threads (replies)
- Like comments
- Mention users in comments (@username)
- Edit/delete own comments

#### Following System
- Follow/unfollow users
- View followers and following lists
- Track follower/following counts

### 3. Services Marketplace

#### Service Listings
- Users can offer services with:
  - Title and description
  - Category (Companionship, Professional Services, Creative Services, etc.)
  - Price per hour
  - Availability schedule
  - Location
  - Tags

#### Service Categories
Available categories include:
- Companionship
- Professional Services
- Creative Services
- Fitness & Health
- Education & Tutoring
- Technology
- Home Services
- Transportation
- Food & Dining
- Entertainment
- Adventure
- Beauty & Wellness

#### Service Management
- Create/edit/delete services
- Activate/deactivate services
- Set availability schedules
- Manage service locations

### 4. Booking System

#### Booking Flow
1. User browses services in Discover section
2. User views service details
3. User creates booking request with:
   - Scheduled date/time
   - Duration (1-24 hours)
   - Total price calculated automatically
   - Notes and special requests
4. Service owner receives booking request
5. Service owner can accept/reject booking
6. Payment link generated via PayMongo upon acceptance
7. Booking tracked through statuses

#### Booking States
- **Pending:** Initial request
- **Accepted:** Owner approved, awaiting payment
- **Rejected:** Owner declined
- **Paid:** Payment completed
- **Completed:** Service provided
- **Cancelled:** Cancelled by either party

#### Payment Integration
- PayMongo payment gateway
- Payment link generated for accepted bookings
- Payment status tracking
- Receipt image uploads (start/middle/end of service)

### 5. Messaging System

#### Real-time Chat
- 1-on-1 conversations between users
- Real-time message delivery
- Read receipts
- Send text messages
- Send images (up to 5 per message)
- Conversation list with last message preview
- Unread message count

#### Conversation Management
- Auto-create conversation on first message
- Persistent conversation history
- Delete conversations
- Mark messages as read

### 6. Reviews & Ratings

#### Reviews
- Reviews created after completed bookings
- One review per booking
- Rating (1-5 stars)
- Caption/text review
- Attach images
- Like reviews

#### Review Features
- Average rating display
- Total reviews count
- Review aggregation per user
- Reviews tied to specific bookings for authenticity

### 7. Notifications System

#### Notification Types
- **Follow:** Someone followed you
- **Like Post:** Someone liked your post
- **Like Comment:** Someone liked your comment
- **Comment:** Someone commented on your post
- **Reply:** Someone replied to your comment
- **Mention:** Someone mentioned you
- **Service Booking:** New booking request
- **Booking Accepted:** Your booking was accepted
- **Booking Rejected:** Your booking was rejected
- **Booking Completed:** Booking marked as complete

#### Notification Features
- Real-time delivery
- Mark as read/unread
- Notification center page
- Notification dropdown in header
- Unread count indicator

### 8. Discovery & Search

#### Advanced Search
- Search across three content types:
  - People (users)
  - Services
  - Posts

#### Search Features
- Full-text search with relevance ranking
- Location-based filtering with radius
- Category filtering for services
- Verified user filter
- Search suggestions
- Recent searches
- Popular searches

#### Location-Based Discovery
- Filter by nearby locations
- Custom location search
- Radius adjustment (1-50km)
- Auto-detect current location
- 315+ Philippine locations pre-loaded

### 9. Profile Pages

#### Own Profile
- Edit profile information
- Manage services
- View own posts
- View saved posts
- View received reviews
- View booking statistics
- Manage location privacy

#### Other User Profiles
- View user information
- Follow/unfollow
- Send message
- View user's posts
- View user's services
- View user's reviews
- View follower/following counts
- Book user's services

### 10. Admin Features

#### Location Management
- Add/edit/delete locations
- Manage city/province data
- Set coordinates for geolocation mapping

#### User Verification
- Verify users
- Manage verified badges

---

## Data Model (Domain Entities)

### Core Entities

**User Profile**
- Identity information
- Profile details
- Location data
- Verification status
- Privacy settings

**Service**
- Service details
- Pricing
- Category
- Availability
- Location

**Post**
- Content
- Media
- Tags
- Location
- Engagement metrics

**Comment**
- Content
- Parent comment (for replies)
- Engagement metrics

**Booking**
- Booking details
- Status
- Payment info
- Completion info

**Message**
- Content
- Conversation reference
- Sender
- Read status

**Conversation**
- Participants
- Last message info

**Review**
- Rating
- Content
- Booking reference

**Notification**
- Type
- Actor
- Reference entities (post, comment, booking)
- Read status

**Location**
- Name
- Province
- Region
- Coordinates

### Relationships
- User → Services (one-to-many)
- User → Posts (one-to-many)
- User → Bookings (booker, owner) (one-to-many)
- User → Comments (one-to-many)
- User → Reviews (reviewer, reviewee) (one-to-many)
- User → Followers/Following (many-to-many)
- Post → Comments (one-to-many)
- Post → Likes (many-to-many)
- Service → Bookings (one-to-many)
- Booking → Reviews (one-to-one or one-to-many)
- Conversation → Messages (one-to-many)

---

## User Flows & Key Workflows

### 1. Onboarding Flow
1. User lands on landing page
2. Signs up (with Clerk)
3. Completes profile setup
4. Optionally enables location
5. Redirected to dashboard

### 2. Service Booking Flow
1. User browses services in Discover
2. Filters by location, category, search query
3. Views service details
4. Clicks "Book Service"
5. Selects date, duration, adds notes
6. Submits booking request
7. Owner receives notification
8. Owner reviews and accepts/rejects
9. If accepted, user receives payment link
10. User completes payment via PayMongo
11. Booking marked as paid
12. Service delivered
13. Booking completed
14. Both parties can leave reviews

### 3. Post Creation Flow
1. User clicks "Create Post" button
2. Uploads images (optional)
3. Writes caption
4. Adds tags (optional)
5. Optionally adds location
6. Publishes post
7. Post appears in feed
8. Followers can interact (like, comment, save)

### 4. Messaging Flow
1. User clicks "Message" on profile
2. System creates conversation (or finds existing)
3. Redirects to chat view
4. Users exchange messages
5. Real-time updates
6. Read receipts
7. Notifications for new messages

### 5. Location Discovery Flow
1. User enables location privacy in settings
2. Browser requests geolocation permission
3. User grants permission
4. App detects coordinates
5. App maps to nearest city
6. Content filters by location + radius
7. User can adjust radius (1-50km)

---

## Technical Requirements

### TanStack Start Requirements
- Use file-based routing (TanStack Start convention)
- Implement SSR where appropriate
- Use TanStack Start's data fetching primitives
- Implement proper code splitting
- Optimize for SEO (meta tags, etc.)

### Convex Requirements
- Define Convex schema for all entities
- Create Convex functions (queries, mutations, actions)
- Implement real-time subscriptions
- Use Convex auth integration with Clerk
- Handle file uploads (images) via Convex storage
- Implement proper indexing for search queries

### Clerk Requirements
- Set up Clerk authentication
- Configure email/password auth
- Optionally configure OAuth providers
- Sync Clerk users with Convex user profiles
- Protect routes using Clerk middleware
- Handle session management

### Real-time Requirements
- Live updates for:
  - New messages
  - New notifications
  - Post likes/comments
  - Booking status changes
  - Follower count updates

### Search Requirements
- Implement full-text search across multiple entities
- Location-based filtering with radius calculations
- Category filtering
- Verified user filtering
- Pagination/infinite scroll
- Debounced search input

### File Upload Requirements
- Image uploads for:
  - Profile avatars
  - Post images
  - Service images
  - Review images
  - Chat images
  - Receipt images
- Implement proper image optimization
- Handle multiple file uploads

### Payment Integration
- Integrate PayMongo for payments
- Generate payment links for bookings
- Handle payment success/failure callbacks
- Update booking status on payment completion

---

## Key Considerations for the AI Agent

### 1. Architectural Freedom
**Do not copy the current structure.** The AI should:
- Design an optimal Convex schema that leverages Convex's strengths
- Organize TanStack Start routes based on UX and best practices
- Structure code for maintainability and scalability
- Use appropriate design patterns for the new stack

### 2. Convex-Specific Design
- Leverage Convex's document-based model
- Use Convex's built-in authorization capabilities
- Design efficient queries with proper indexes
- Use Convex functions for business logic
- Implement real-time subscriptions where beneficial

### 3. Clerk Integration
- Use Clerk's Convex integration for seamless auth
- Handle user profile sync on signup/login
- Implement protected routes using Clerk middleware
- Use Clerk components for auth UI (optional)

### 4. State Management Strategy
- Use TanStack Query for server state (data fetching)
- Consider using a simple state solution for UI state
- Leverage Convex's real-time capabilities for live data
- Minimize redundant state layers

### 5. Type Safety
- Leverage TypeScript throughout
- Use Convex's generated types
- Use TanStack Start's type-safe routing
- Ensure end-to-end type safety where possible

### 6. Performance Optimization
- Implement proper code splitting
- Optimize bundle size
- Use server components where appropriate (TanStack Start)
- Implement image optimization
- Use Convex's efficient querying

### 7. Developer Experience
- Clear file organization
- Consistent naming conventions
- Good TypeScript configuration
- Proper environment variable management
- Helpful error messages

---

## Pages/Routes to Implement

### Public Routes
- `/` - Landing page (marketing)
- `/auth/login` - Login page (Clerk)
- `/auth/signup` - Signup page (Clerk)

### Protected Routes (require authentication)
- `/dashboard` - Main feed (home page)
- `/discover` - Discovery page (search & filter)
- `/profile/$userId` - User profile page
- `/profile/$userId/settings` - Profile settings
- `/create-post` - Create new post
- `/post/$postId` - Post detail view
- `/service/$serviceId` - Service detail view
- `/bookings` - Manage bookings
- `/messages` - Message center
- `/messages/$conversationId` - Specific conversation
- `/notifications` - Notification center
- `/services` - Browse all services
- `/reviews` - Browse reviews
- `/search` - Dedicated search page (optional, or integrate into Discover)

### Admin Routes
- `/admin/locations` - Manage locations
- `/admin/users` - Manage users
- `/admin/verification` - Verify users

---

## UI Components Needed

### Core Components
- Navigation (desktop + mobile)
- User menu dropdown
- Notification dropdown
- Search bar with suggestions
- Location filter dialog
- Post card
- Post detail modal
- Service card
- Booking card
- Message list item
- Conversation view
- Profile header
- Review card
- Notification item

### Form Components
- Edit profile form
- Create post form
- Create service form
- Booking request form
- Review form
- Message input

### Dialog/Modal Components
- Post detail modal
- Book service dialog
- Edit service dialog
- Followers/following dialog
- Booking details dialog
- Location filter dialog

---

## Important Features to Preserve

### Location-Based Discovery
- Philippines-focused location data
- Geolocation detection
- Radius-based filtering
- Privacy controls

### Real-time Interactions
- Live messaging
- Real-time notifications
- Instant updates for likes/comments

### Payment Flow
- PayMongo integration
- Booking status tracking
- Receipt uploads

### Verification System
- Verified badges
- Trust indicators
- Review authenticity (tied to bookings)

### Multi-Entity Search
- Search across users, services, and posts
- Unified search experience
- Advanced filtering

---

## Testing & Quality Requirements

- Unit tests for business logic
- Integration tests for Convex functions
- E2E tests for critical user flows
- Type checking (no `any` types)
- Linting (consistent code style)
- Accessibility considerations (ARIA labels, keyboard navigation)

---

## Migration Notes

When rewriting, consider:

### Data Migration (if needed)
- Migrate users from Supabase to Clerk
- Migrate data from PostgreSQL to Convex
- Preserve existing user-generated content

### Feature Parity
- Ensure all current features are reimplemented
- Maintain data relationships
- Preserve user expectations

### Incremental Approach
Consider whether to:
- Build new app from scratch and migrate data
- Incrementally migrate features
- Launch as v2 with fresh start

---

## AI Agent Guidelines

### What to Focus On

1. **Design First:** Plan the architecture before coding
2. **Convex-Native:** Design with Convex's strengths in mind
3. **User Experience:** Prioritize intuitive flows and performance
4. **Type Safety:** Leverage TypeScript throughout
5. **Real-First:** Use Convex's real-time capabilities
6. **Maintainable:** Write clean, well-organized code

### What to Avoid

1. Don't copy the current structure blindly
2. Don't over-engineer simple features
3. Don't ignore performance
4. Don't skip proper error handling
5. Don't ignore accessibility

### Decision Points

The AI should make decisions about:
- File/folder organization
- How to structure Convex schema and functions
- How to organize TanStack Start routes
- State management strategy
- Component composition patterns
- Error handling patterns
- Loading states
- Optimistic UI updates

---

## Success Criteria

The rewritten application should:

✅ Provide all current functionality
✅ Use TanStack Start for the framework
✅ Use Convex for backend + database
✅ Use Clerk for authentication
✅ Have a clean, maintainable architecture
✅ Be fully type-safe
✅ Have real-time features working
✅ Have proper SEO (SSR)
✅ Perform well (fast load times, smooth interactions)
✅ Be accessible
✅ Have tests for critical functionality
✅ Be ready for production deployment

---

## Questions for the AI Agent

Before starting, the AI should consider:

1. What's the optimal Convex schema structure for this domain?
2. How should Convex functions be organized (by entity, by feature)?
3. How to best integrate Clerk with Convex for auth?
4. What's the best way to structure TanStack Start routes?
5. How to handle complex search queries in Convex?
6. What's the best approach for image uploads?
7. How to implement location-based filtering efficiently?
8. How to structure the UI components for reusability?
9. What's the optimal state management strategy?
10. How to handle real-time subscriptions effectively?

---

**End of Guide**

The AI agent now has comprehensive context about the LBF application and clear guidance on rewriting it with TanStack Start, Convex, and Clerk. The agent should use this information to design and build an optimal implementation while maintaining feature parity with the current application.
