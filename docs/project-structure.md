# AI DSA Tutor Project Structure

This document outlines the complete file structure of the AI DSA Tutor project.

## Directory Structure

```
ai-dsa-tutor/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── api/               # API routes
│   │   │   ├── ai/           # AI chat endpoints
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── chats/        # Chat management endpoints
│   │   │   └── debug/        # Debug interface endpoints
│   │   ├── dashboard/        # Dashboard page
│   │   ├── debug/           # Debug interface page
│   │   └── page.tsx         # Landing page
│   ├── components/           # React components
│   │   ├── auth/            # Authentication components
│   │   ├── chat/            # Chat interface components
│   │   ├── layout/          # Layout components
│   │   └── ui/              # Reusable UI components
│   ├── lib/                 # Utility functions and configurations
│   ├── providers/           # React context providers
│   └── styles/              # Global styles and CSS modules
├── docs/                    # Documentation
├── public/                  # Static assets
└── types/                   # TypeScript type definitions
```

## Configuration Files
- `/next.config.mjs` - Next.js configuration
- `/postcss.config.mjs` - PostCSS configuration
- `/postcss.config.js` - PostCSS configuration (legacy)
- `/tailwind.config.ts` - Tailwind CSS configuration
- `/tsconfig.json` - TypeScript configuration
- `/eslint.config.mjs` - ESLint configuration
- `/components.json` - UI components configuration
- `/next-env.d.ts` - Next.js TypeScript declarations
- `.env.local` - Environment variables

## Key Components

### API Routes
- `api/ai/route.ts`: Handles AI interactions with Claude
- `api/chats/route.ts`: Manages chat CRUD operations
- `api/chats/[chatId]/route.ts`: Single chat operations
- `api/debug/route.ts`: Debug interface data operations
- `/src/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `/src/app/api/auth/register/route.ts` - User registration endpoint

### Chat Components
- `ChatInterface.tsx`: Main chat interface
- `ChatSidebar.tsx`: Chat history and navigation
- `MarkdownRenderer.tsx`: Message formatting and code highlighting
- `/src/components/chat/ChatInterface.tsx` - Chat interface component
- `/src/components/chat/ChatSidebar.tsx` - Chat sidebar component

### UI Components
- `auto-resize-textarea.tsx`: Dynamic textarea component
- `button.tsx`: Reusable button component
- `input.tsx`: Form input components
- `loading.tsx`: Loading states and animations
- `/src/components/ui/animated-gradient-text.tsx` - Gradient text animation
- `/src/components/ui/avatar.tsx` - Avatar component
- `/src/components/ui/box-reveal.tsx` - Box reveal animation
- `/src/components/ui/button.tsx` - Button component
- `/src/components/ui/card.tsx` - Card component
- `/src/components/ui/carousel.tsx` - Carousel component
- `/src/components/ui/macbook-scroll.tsx` - MacBook scroll animation
- `/src/components/ui/orbiting-circles.tsx` - Orbiting circles animation
- `/src/components/ui/rainbow-button.tsx` - Rainbow button component
- `/src/components/ui/typing-animation.tsx` - Typing animation
- `/src/components/ui/typing-topics.tsx` - Topics typing component
- `/src/components/ui/auto-resize-textarea.tsx` - Auto-resize textarea

### Utility Functions
- `mongodb.ts`: Database connection and utilities
- `utils.ts`: Helper functions and utilities
- `auth.ts`: Authentication utilities
- `/src/lib/utils.ts` - Utility functions
- `/src/lib/fonts.ts` - Font configurations
- `/src/lib/auth.ts` - Authentication utilities
- `/src/lib/db.ts` - Database utilities

### Features

### Authentication
- NextAuth.js integration
- Google OAuth support
- Protected routes and API endpoints
- Implemented using NextAuth.js
- Google OAuth provider integration
- Custom login/register forms
- Session management

### Chat System
- Real-time message streaming
- Chat persistence in MongoDB
- Message history
- Auto chat naming
- Code syntax highlighting
- Markdown support
- Collapsible sidebar with recent chats
- Auto-resizing message input
- Clean, minimalistic design
- Welcome screen with instructions

### Debug Interface
- MongoDB data viewer
- Collection management
- Data refresh functionality
- Collection clearing

### UI/UX
- Responsive design
- Dark/light mode support
- Loading states
- Error handling
- Auto-scrolling
- Message formatting
- TailwindCSS for utility-first styling
- Custom gradients and animations
- Responsive design patterns
- Consistent color scheme

## Dependencies

### Core
- Next.js 14
- React 18
- TypeScript
- TailwindCSS

### Authentication
- NextAuth.js
- Google OAuth

### Database
- MongoDB
- MongoDB Atlas

### AI Integration
- Anthropic Claude API
- Edge Runtime

### UI/Formatting
- Lucide Icons
- React Markdown
- Rehype Highlight
- Rehype Raw
- Remark GFM

## Current Status
- Authentication system complete
- Core chat interface implemented
- Layout system optimized
- Ready for AI integration
