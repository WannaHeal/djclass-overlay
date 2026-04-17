# DJ CLASS OBS Overlay - Agent Documentation

## Project Overview

This is a Next.js application configured for deployment on **Cloudflare Workers** using `@opennextjs/cloudflare`.

## Architecture

### Deployment Platform
- **Primary**: Cloudflare Workers with Workers Assets
- **Build Tool**: `@opennextjs/cloudflare` (OpenNext adapter)
- **Runtime**: `workerd` runtime (Web APIs + Node.js compat)

### Directory Structure

```
djclass-overlay/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main page (URL generator)
│   ├── page.module.css    # Main page styles
│   ├── globals.css        # Global styles
│   ├── not-found.tsx      # 404 error page
│   ├── api/
│   │   └── djclass/
│   │       └── route.ts   # API route
│   └── overlay/
│       ├── page.tsx       # OBS overlay page
│       └── overlay.module.css  # Overlay styles
├── .open-next/            # Build output directory
│   ├── worker.js          # Worker entry point
│   └── assets/            # Static assets
├── open-next.config.ts    # OpenNext configuration
├── wrangler.toml          # Cloudflare configuration
├── next.config.ts         # Next.js configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## Key Features

### 1. Main Page (`app/page.tsx`)
- Form with username input and button mode selector (4B, 5B, 6B, 8B)
- Generates absolute URLs with URL-encoded parameters
- Copy-to-clipboard functionality
- Instructions for OBS setup

### 2. Overlay Page (`app/overlay/page.tsx`)
- Reads `user` and `mode` from URL parameters
- Fetches DJ CLASS data from V-Archive API via internal API route
- Displays username, mode, grade, and animated points
- Transparent background for OBS
- Polling every 30 seconds
- Animated number display when points change

### 3. API Route (`app/api/djclass/route.ts`)
- Proxies requests to V-Archive API
- Handles CORS and data validation
- Runs in Workers runtime via OpenNext adapter

### 4. Not Found Page (`app/not-found.tsx`)
- Custom 404 error page
- Simple, clean design

## API Integration

The overlay fetches from V-Archive API:
```
https://v-archive.net/api/v2/archive/{username}/djClass/{mode}
```

Example response format:
```json
{
  "djClass": "SP",
  "djPowerConversion": 12345.67
}
```

TypeScript interfaces:
```typescript
interface VArchiveResponse {
  djClass: string;
  djPowerConversion: number;
}
```

## Build Commands

```bash
# Development (Next.js dev server)
npm run dev

# Build and preview locally with Workers runtime
npm run preview

# Build and deploy to Cloudflare
npm run deploy

# Generate Cloudflare types
npm run cf-typegen

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Deployment

### Using Wrangler CLI

The project uses the OpenNext adapter for Cloudflare Workers:

```bash
# Preview locally (builds and runs in Workers runtime)
npm run preview

# Deploy to Cloudflare
npm run deploy
```

### Automatic Configuration

If you run `wrangler deploy` without configuration, Wrangler will automatically detect Next.js and generate the necessary configuration.

### Manual Configuration

The project includes the following configuration files:

#### wrangler.toml
```toml
name = "djclass-overlay"
main = ".open-next/worker.js"
compatibility_date = "2026-04-17"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".open-next/assets"
binding = "ASSETS"

[observability]
enabled = true
```

#### open-next.config.ts
```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
export default defineCloudflareConfig();
```

### next.config.ts
- Trailing slashes enabled
- Custom headers for OBS frame embedding (X-Frame-Options: ALLOWALL)
- CORS headers configured

## Supported Next.js Features

The Cloudflare OpenNext adapter supports most Next.js features:

| Feature | Status |
|---------|--------|
| App Router | Supported |
| Pages Router | Supported |
| Route Handlers | Supported |
| React Server Components | Supported |
| SSG | Supported |
| SSR | Supported |
| ISR | Supported |
| Server Actions | Supported |
| Response streaming | Supported |
| Middleware | Supported |
| Image optimization | Supported via Cloudflare Images |
| Partial Prerendering (PPR) | Supported |

## Styling Conventions

- CSS Modules for component-scoped styles
- Transparent backgrounds for OBS compatibility
- Gradient accents in purple (#667eea, #764ba2)
- Responsive design with media queries
- Font sizes optimized for overlay readability

## Important Implementation Details

1. **URL Encoding**: Usernames are URL-encoded when generating and decoded when reading
2. **Polling**: 30-second interval for data refresh
3. **Animation**: Uses requestAnimationFrame with ease-out cubic interpolation
4. **Point Display**: Integer part is larger (3rem), decimal part is smaller (1.5rem)
5. **Error Handling**: Shows error state if API request fails

## Platform-Specific Notes

### Windows Development
- OpenNext adapter works on Windows
- Use `npm run preview` to test locally in Workers runtime
- Use `npm run deploy` to deploy from Windows

### Workers Runtime
- Supports both Web Standard APIs and Node.js APIs (with nodejs_compat flag)
- Build output goes to `.open-next/` directory
- Assets are served via the ASSETS binding

## Troubleshooting

### Build Failures
- Ensure Node.js v18+ is used
- Run `npm install` to ensure all dependencies are installed
- Check `npm run typecheck` for TypeScript errors

### API Route Errors
- The new adapter handles runtime automatically; no need for `export const runtime = 'edge'`
- Check for Node.js-specific APIs if errors occur

### Deployment Issues
- Check that `wrangler.toml` is properly configured
- Verify Cloudflare account has Workers enabled
- Ensure `compatibility_date` is set to `2024-09-23` or later
