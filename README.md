# meform

A full-stack TypeScript form builder with embeddable widgets.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, React Query, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Prisma + MySQL
- **Validation**: Zod
- **Auth**: Server-side cookie-based (httpOnly, secure)
- **Testing**: Vitest (unit), Playwright (e2e), MSW (mocking)

## Project Structure

```
meform/
├── apps/
│   ├── dashboard/     # Next.js dashboard app
│   └── embed/         # Vanilla TS embed SDK
├── packages/
│   ├── config/        # Shared constants & theme
│   ├── db/            # Prisma schema & client
│   ├── dto/           # Zod DTOs
│   ├── ui/            # Reusable React components
│   └── utils/         # Shared utilities
└── .github/workflows/ # CI workflows
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+ (comes with Node.js)
- MySQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. Set up the database:
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # Seed with demo data
   npm run db:seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Demo Credentials

After seeding:
- Email: `demo@meform.com`
- Password: `demo123`

## Development

### Available Scripts

- `npm run dev` - Start dashboard dev server
- `npm run build` - Build all packages
- `npm test` - Run unit tests
- `npm run test:e2e` - Run e2e tests
- `npm run lint` - Lint all packages
- `npm run typecheck` - Type check all packages
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database
- `npm run db:studio` - Open Prisma Studio

### Embed SDK

The embed SDK is built from `apps/embed` and outputs to `apps/dashboard/public/cdn/v1/meform.js`.

To build:
```bash
cd apps/embed
npm run build
```

### Usage

Add the embed script to your website:

```html
<script 
  src="https://your-domain.com/cdn/v1/meform.js" 
  data-application-id="YOUR_APPLICATION_ID">
</script>
```

The widget will:
1. Detect the current hostname and path
2. Fetch matching forms based on URL rules
3. Display a floating button (bottom-right)
4. Open a form popup on click
5. Submit data to the API

### API

All API routes are versioned under `/api/v1`:

- **Auth**: `/api/v1/auth/*` (register, login, logout, verify-email, password-reset)
- **Applications**: `/api/v1/applications/*`
- **URL Rules**: `/api/v1/applications/:appId/url-rules/*`
- **Forms**: `/api/v1/applications/:appId/forms/*`
- **Fields**: `/api/v1/applications/:appId/forms/:formId/fields/*`
- **Submissions**: `/api/v1/applications/:appId/submissions`

**Public API**:
- `/public/v1/config?applicationId=...` - Get forms for current hostname/path
- `/public/v1/submit` - Submit form data

### URL Rules

URL rules match forms to specific pages:

- **Exact match**: `/pricing`
- **Wildcard**: `/blog/*` (matches `/blog/` and all subpaths)
- **Regex**: `^/docs/.*$` (patterns starting with `^`)

### Testing

Unit tests:
```bash
npm test
```

E2E tests:
```bash
npm run test:e2e
```

## Architecture

### Clean Architecture

- **Packages**: Shared, reusable code
- **Apps**: Application-specific code
- **Separation**: Clear boundaries between layers

### Practices

- ✅ No typecasting; proper types everywhere
- ✅ Zod validation at API boundaries
- ✅ Constants hoisted to config package
- ✅ Reusable components in UI package
- ✅ Tailwind for all styling
- ✅ Scalable and modular code

### Color Palette

Defined in `packages/config/src/theme.ts`:
- Dark: `#201e1f`
- Accent: `#ff4000`
- Accent Soft: `#faaa8d`
- Background Soft: `#feefdd`
- Info: `#50b2c0`

## License

MIT

