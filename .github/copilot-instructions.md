# Email Bot - Copilot Instructions

## Architecture Overview

**Full-stack email campaign management SPA**: React 18 frontend (TypeScript, Zustand, Tailwind) + Express.js backend (Node.js, PostgreSQL via Neon) + Google Gemini API for AI-powered email drafting.

**Key Components**:
- **Frontend** (`src/`): Tab-based UI for Contacts, Templates, Campaign Sender, Inbox
- **Backend** (`server/`): RESTful API with CORS, PostgreSQL pool management
- **State Management**: Zustand store (`useAppStore.ts`) - not Redux, single centralized store
- **Type Safety**: Full TypeScript in frontend; JavaScript in backend

## Critical Data Flow

1. **Initial Load**: App → `useAppStore.fetchContacts/fetchTemplates()` → API requests → PostgreSQL
2. **Contact Selection**: Select contacts → store → `selectedContacts[]` array (string IDs only)
3. **Campaign Sending**: 
   - Select template + contacts → `CampaignSender` validates selections
   - POST to `/api/campaign/send` with template + contact emails
   - Backend calls Nodemailer → database status updates
   - Inbox reflects email events

## Developer Workflows

**Start dev server** (frontend + backend):
```bash
npm run dev          # Starts Vite dev server on :5173
# In separate terminal:
cd server && npm run dev  # Node.js backend on :3001
```

**Build & Test**:
- `npm run build` - TypeScript check + Vite bundle
- `npm run lint` - ESLint across all files
- `npm test` - Vitest (React Testing Library for components)

**Database Setup**: 
- Connection via Neon PostgreSQL (`.env` → `DATABASE_URL`)
- Initialize: `node server/init-db.js` (runs `schema.sql`)

## Project-Specific Patterns

### API Layer (`src/lib/api.ts`)
- **Custom `request<T>()`**: Unified fetch wrapper with error handling
- **Grouped endpoints**: `api.contacts.getAll()`, `api.templates.create()`, etc.
- **Error handling**: `ApiError` class with status/code — **always catch ApiError, not generic Error**

### Zustand Store Pattern
- **No immer middleware** — pure JS object spreads for immutability
- **Async actions**: Wrap in try/catch, update loading state manually
- **Optimistic updates**: E.g., `deleteContact` removes UI first, reverts on error (see store)
- **Never use context providers** — store accessed directly via `useAppStore()`

### Component Structure
- **Lazy loading**: Use `lazy()` for route-like tabs (Contacts, Templates, Campaign, Inbox)
- **Loading states**: Components accept `isLoading` prop + show `Loader2` spinner
- **Validation**: Zod schemas in `server/schemas/index.js` — validate on POST/PUT before DB

### Backend Middleware
- **`asyncHandler.js`**: Wraps route handlers, auto-catches exceptions → error middleware
- **`validation.js`**: Zod schema validation middleware (use before route logic)
- **Error Middleware**: Catches all exceptions, returns `{ error: { message, code } }` JSON

## External Integrations

- **Google Gemini API** (`server/services/ai.js`): Generates Russian-language email drafts from conversation history
  - Fallback: Mock AI if `GEMINI_API_KEY` unset or starts with "mock"
  - Model: `gemini-pro`; prompt always requests Russian output
- **Nodemailer** (`server/services/email.js`): Sends campaigns via configured SMTP
- **PostgreSQL (Neon)**: All data persistent; transactions not used (simple queries via pool)

## Critical Conventions

1. **Path Aliases**: Always use `@/` prefix in frontend (`@/components`, `@/lib`, `@/types`)
2. **Contact Status Enum**: `'new' | 'sent' | 'opened' | 'replied' | 'bounced'` — never invent new statuses
3. **Date Handling**: Backend returns `Date` in JSON (auto-serialized); frontend treatsstrings as ISO timestamps
4. **Bulk Operations**: Use `/api/{resource}/bulk` endpoint for CSV imports (contacts, templates)
5. **No Route Query Params**: All filters/selections stored in Zustand, not URL — app is client-only routing

## Files to Reference When Adding Features

| Task | Key Files |
|------|-----------|
| Add new field to Contact | `src/types/index.ts` → `server/schema.sql` → `server/services/contacts.js` → `src/store/useAppStore.ts` |
| New API endpoint | Create `server/routes/{resource}.js` → register in `server/index.js` → expose in `src/lib/api.ts` |
| New component | Place in `src/components/{domain}/` → import with `@/` alias → add Suspense + lazy() in App if tab-level |
| Email template preview | Extend `src/components/templates/EmailTemplates.tsx` → keep DOMPurify for HTML body safety |
