# Agent Instructions for LetsBeFriends

## Package Manager

This project uses **bun** as the package manager. Use bun commands instead of npm or yarn:

- `bun install` - Install dependencies
- `bun run <script>` - Run npm scripts
- `bun add <package>` - Add a package
- `bunx <package>` - Run a package binary

## Build Commands

- `bun run dev` - Start Convex dev server + Vite on port 3000
- `bun run build` - Production build (Vite + TypeScript)
- `bun run preview` - Preview production build
- `bun run typecheck` - TypeScript check without emit

## Lint Commands

- `bun run lint` - Run ESLint on all files
- `bun run lint:fix` - Run ESLint with auto-fix

## Test Commands

- `bun run test` - Run all tests with Vitest
- `bun run test -- --run <file>` - Run a single test file
- `bun run test -- --watch` - Run tests in watch mode
- `bun run test -- --reporter=verbose` - Run tests with verbose output

**Note**: Run `bun run lint` and `bun run typecheck` after making changes.

## Code Style

### Imports

- Group imports: React/hooks, third-party libraries, local imports
- Use path alias `@/` for local imports (e.g., `@/lib/utils`, `@/components/ui/button`)
- Use Convex imports from `convex/react` and `convex/_generated/api`
- Prefer explicit named imports over default imports
- External Convex packages use relative paths (e.g., `../../convex/_generated/api`)

Example:
```typescript
import { useState } from 'react'
import { useQuery as useConvexQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

### Formatting

- Use single quotes for strings
- No trailing semicolons
- 2-space indentation
- Maximum line length: 100 characters
- Use `const` or `let` (never `var`)

### Types & Naming

- **Components**: PascalCase (e.g., `PostCard`, `UserProfile`)
- **Functions**: camelCase (e.g., `handleSubmit`, `getStorageUrl`)
- **Convex functions**: camelCase exported as const (e.g., `export const createPost = mutation({...})`)
- **Interfaces**: PascalCase with `Props` suffix for component props (e.g., `PostCardProps`)
- **Variables/Types**: Use strict TypeScript; avoid `any`
- **Unused variables**: Prefix with `_` (e.g., `_unusedVar`)

### Error Handling

- Always handle async errors with try/catch
- Use `void` keyword when intentionally not awaiting promises (e.g., `void toggleLike()`)
- Check for null/undefined before accessing properties
- Return early for guard clauses to reduce nesting

Example:
```typescript
const handleSubmit = async () => {
  if (!currentUser) return
  
  try {
    await createPost({ userId: currentUser._id, caption })
  } catch (error) {
    console.error('Failed to create post:', error)
  }
}
```

### Component Patterns

- Use functional components with hooks
- Use `React.forwardRef` for ref-passing components
- Destructure props in function parameters
- Use Tailwind for styling with `cn()` utility for conditional classes
- Store component display name: `Component.displayName = 'ComponentName'`

Example:
```typescript
interface ButtonProps {
  variant?: 'default' | 'ghost'
  onClick?: () => void
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn('px-4 py-2', variant === 'ghost' && 'hover:bg-muted')}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
```

### Convex Patterns

- Use Convex validation: `v.id()`, `v.string()`, `v.optional()`, etc.
- Use `Date.now()` for timestamps
- Use indexes for efficient queries
- Always add createdAt/updatedAt timestamps
- Use `ctx.db.patch()` for partial updates
- Query functions end with verb (e.g., `getPost`, `listPosts`, `isPostLiked`)
- Mutation functions use action verbs (e.g., `createPost`, `toggleLike`, `savePost`)

Example:
```typescript
export const createPost = mutation({
  args: {
    userId: v.id('users'),
    caption: v.string(),
    images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const postId = await ctx.db.insert('posts', {
      ...args,
      likesCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return postId
  },
})
```

### File Organization

- Routes in `src/routes/` (file-based routing with TanStack Router)
- Components in `src/components/` with subfolders: `ui/`, `layout/`
- Convex functions in `convex/` directory
- Utilities in `src/lib/`
- Hooks in `src/hooks/`
- Use shadcn/ui components from `@/components/ui/`

### Styling Guidelines

- Use Tailwind CSS v4 with CSS variables
- Use `class-variance-authority` for component variants
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Follow shadcn/ui patterns for component structure
- Custom color scheme: purple (#b64e8d) and blue (#0d8ee0) accents

### Route Conventions

- File-based routing with TanStack Router
- Route files in `src/routes/` directory
- Dynamic segments use `$` prefix (e.g., `post.$postId.tsx`)
- Layout routes use `__root.tsx`
- Index routes use `.index.tsx` suffix

### Git

- Never run `npx convex deploy` unless explicitly instructed
- Never run git commands unless explicitly instructed
- Do not commit secrets or .env files
