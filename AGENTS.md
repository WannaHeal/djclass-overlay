# DJ CLASS OBS Overlay - Agent Documentation

## Project Overview

A Next.js application deployed on **Cloudflare Workers** using `@opennextjs/cloudflare` (OpenNext adapter v1.0+). This is a modern edge-native deployment that runs on the `workerd` runtime.

## Architecture

### Deployment Platform
- **Primary**: Cloudflare Workers with Workers Assets
- **Build Tool**: `@opennextjs/cloudflare` (OpenNext adapter v1.0+)
- **Runtime**: `workerd` (Web APIs + Node.js compatibility)
- **Build Output**: `.open-next/` directory

### Directory Structure

```
djclass-overlay/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main page (URL generator form)
│   ├── page.module.css    # Main page styles
│   ├── globals.css        # Global styles
│   ├── not-found.tsx      # 404 error page
│   ├── api/
│   │   └── djclass/
│   │       └── route.ts   # API route (V-Archive proxy)
│   └── overlay/
│       ├── page.tsx       # OBS overlay page
│       └── overlay.module.css  # Overlay styles
├── .open-next/            # Build output directory
│   ├── worker.js          # Worker entry point
│   └── assets/            # Static assets
├── open-next.config.ts    # OpenNext configuration
├── wrangler.toml          # Cloudflare Workers configuration
├── next.config.ts         # Next.js configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
└── cloudflare-env.d.ts    # Auto-generated Cloudflare types
```

## Key Features

### 1. Main Page (`app/page.tsx`)
- Form with username input and button mode selector (4B, 5B, 6B, 8B)
- Generates absolute URLs with URL-encoded parameters
- Copy-to-clipboard functionality
- Instructions for OBS setup
- Styled with CSS Modules (page.module.css)

### 2. Overlay Page (`app/overlay/page.tsx`)
- Reads `user` and `mode` from URL search parameters
- Fetches DJ CLASS data from V-Archive API via internal API route (`/api/djclass`)
- Displays:
  - Username (URL-decoded)
  - Button mode badge
  - DJ CLASS rank (e.g., SHOWSTOPPER III, BEAT MAESTRO I)
  - Animated DJ Power points
  - Next DJ CLASS target with required power cutline
- Transparent background for OBS integration
- Polling every 30 seconds for live updates
- Smooth number animation using requestAnimationFrame with ease-out cubic interpolation
- **Firework effects** when rank increases (celebration animation)
- **Rank transition animations** with glow effects when class changes
- **Debug simulation panel** (Ctrl+Shift+D) for testing rank transitions

### 3. API Route (`app/api/djclass/route.ts`)
- Proxies requests to V-Archive API: `https://v-archive.net/api/v2/archive/{username}/djClass/{mode}`
- Validates response data
- Returns JSON: `{ djClass: string, djPowerConversion: number }`
- Automatically runs in Workers runtime (no `export const runtime = 'edge'` needed)

### 4. Not Found Page (`app/not-found.tsx`)
- Custom 404 error page with centered layout
- Uses globals.css for consistent styling

## API Integration

### V-Archive API

Endpoint: `https://v-archive.net/api/v2/archive/{username}/djClass/{mode}`

Parameters:
- `username`: V-Archive username (URL-encoded)
- `mode`: Button mode (4B, 5B, 6B, or 8B)

Response format:
```json
{
  "djClass": "SHOWSTOPPER III",
  "djPowerConversion": 1234.5678
}
```

TypeScript interface:
```typescript
interface VArchiveResponse {
  djClass: string;        // Full class name with level, e.g., "SHOWSTOPPER III", "BEAT MAESTRO I"
  djPowerConversion: number;  // DJ Power points with 4 decimal places
}
```

### DJ CLASS Progression

The DJ CLASS system has 14 ranks with 4 levels each (IV → III → II → I), except:
- **BEGINNER**: Single level (0 power)
- **THE LORD OF DJMAX**: Highest rank, single level (9980 power)

| Class | IV | III | II | I |
|-------|-----|-----|-----|-----|
| THE LORD OF DJMAX | - | - | - | 9980 |
| BEAT MAESTRO | 9900 | 9930 | 9950 | 9970 |
| SHOWSTOPPER | 9700 | 9750 | 9800 | 9850 |
| HEADLINER | 9400 | 9500 | 9600 | 9650 |
| TREND SETTER | 9000 | 9100 | 9200 | 9300 |
| PROFESSIONAL | 8600 | 8700 | 8800 | 8900 |
| HIGH CLASS | 7800 | 8000 | 8200 | 8400 |
| PRO DJ | 7000 | 7200 | 7400 | 7600 |
| MIDDLEMAN | 6200 | 6400 | 6600 | 6800 |
| STREET DJ | 5200 | 5500 | 5800 | 6000 |
| ROOKIE | 4000 | 4300 | 4600 | 4900 |
| AMATEUR | 2400 | 2800 | 3200 | 3600 |
| TRAINEE | 500 | 1000 | 1500 | 2000 |
| BEGINNER | 0 | - | - | - |

## Build Commands

```bash
# Development (Next.js dev server on localhost:3000)
npm run dev

# Build and preview locally with Workers runtime
npm run preview

# Build and deploy to Cloudflare Workers
npm run deploy

# Generate Cloudflare types from wrangler.toml
npm run cf-typegen

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Deployment

### Using OpenNext CLI (Recommended)

The project uses `@opennextjs/cloudflare` for building and deployment:

```bash
# Preview locally (builds and runs in Workers runtime)
npm run preview

# Deploy to Cloudflare Workers
npm run deploy
```

### Configuration Files

#### wrangler.toml
```toml
#:schema node_modules/wrangler/config-schema.json
name = "djclass-overlay"
main = ".open-next/worker.js"
compatibility_date = "2026-04-17"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = ".open-next/assets"
binding = "ASSETS"

[observability]
enabled = true
head_sampling_rate = 1

[vars]
NODE_ENV = "production"
```

Key settings:
- `compatibility_date`: Must be `2024-09-23` or later for OpenNext support
- `compatibility_flags`: `["nodejs_compat"]` enables Node.js API compatibility
- `main`: Points to `.open-next/worker.js` (generated by build)

#### open-next.config.ts
```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
export default defineCloudflareConfig();
```

Uses default Cloudflare configuration from OpenNext adapter.

#### next.config.ts
```typescript
const nextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  poweredByHeader: false,
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'ALLOWALL' },
        { key: 'Access-Control-Allow-Origin', value: '*' },
      ],
    },
  ],
};
```

Key settings:
- `trailingSlash: true` - Better URL consistency
- `X-Frame-Options: ALLOWALL` - Required for OBS browser source embedding
- `Access-Control-Allow-Origin: *` - CORS for API access
- `images.unoptimized: true` - Simplifies deployment (no Cloudflare Images required)

## Supported Next.js Features

The Cloudflare OpenNext adapter supports most Next.js features:

| Feature | Status |
|---------|--------|
| App Router | ✅ Supported |
| Pages Router | ✅ Supported |
| Route Handlers | ✅ Supported |
| React Server Components | ✅ Supported |
| SSG | ✅ Supported |
| SSR | ✅ Supported |
| ISR | ✅ Supported |
| Server Actions | ✅ Supported |
| Response streaming | ✅ Supported |
| Middleware | ✅ Supported |
| Image optimization | ⚠️ Use `unoptimized: true` or Cloudflare Images |
| Partial Prerendering (PPR) | ✅ Supported |

## Styling Conventions

- **CSS Modules**: All component-scoped styles (e.g., `page.module.css`, `overlay.module.css`)
- **globals.css**: Global styles, CSS variables, and utility classes
- **Transparent backgrounds**: Required for OBS compatibility (no background color on overlay)
- **Color scheme**: Purple gradients (#667eea, #764ba2) for accents
- **Typography**: 
  - Integer part of points: 3rem
  - Decimal part of points: 1.5rem
- **Responsive**: Uses CSS custom properties for consistent spacing

## Important Implementation Details

1. **URL Encoding**: Usernames are URL-encoded when generating URLs and decoded when reading from URL parameters
2. **Polling Interval**: 30 seconds for data refresh
3. **Animation**: Uses `requestAnimationFrame` with ease-out cubic interpolation for number transitions
4. **Point Display Format**: Integer part larger (3rem), decimal part smaller (1.5rem)
5. **Error Handling**: Shows error state with message if API request fails
6. **No Runtime Export**: With OpenNext v1.0+, no need for `export const runtime = 'edge'`

## Platform-Specific Notes

### Windows Development
- OpenNext adapter v1.0+ works natively on Windows (no WSL required)
- Use `npm run preview` to test locally in Workers runtime
- Use `npm run deploy` to deploy from Windows

### Workers Runtime
- Supports both Web Standard APIs and Node.js APIs (with `nodejs_compat` flag)
- Build output goes to `.open-next/` directory (not `.vercel/output/`)
- Assets are served via the ASSETS binding (configured in `wrangler.toml`)

## Troubleshooting

### Build Failures
- Ensure Node.js v18+ is used: `node --version`
- Run `npm install` to ensure all dependencies are installed
- Check `npm run typecheck` for TypeScript errors
- If OpenNext build fails, try `npm run build` first to check for Next.js errors

### API Route Errors
- With OpenNext v1.0+, the runtime is handled automatically
- No need for `export const runtime = 'edge'` in route files
- Avoid Node.js-specific APIs that aren't supported in `workerd` runtime

### Deployment Issues
- Verify `wrangler.toml` is properly configured (especially `main` and `assets`)
- Check Cloudflare account has Workers enabled
- Ensure `compatibility_date` is `2024-09-23` or later
- Run `npm run cf-typegen` if getting TypeScript errors about Cloudflare types

### OBS Display Issues
- Verify overlay URL is correct and includes `user` and `mode` parameters
- Check that `X-Frame-Options: ALLOWALL` header is being sent
- Ensure overlay page has transparent background (check CSS)
- Try refreshing the browser source in OBS if data isn't updating

## Dependencies

Key dependencies (from package.json):

```json
{
  "dependencies": {
    "@opennextjs/cloudflare": "^1.0.0",
    "next": "^15.5.2",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20250417.0",
    "typescript": "^5.7.2",
    "wrangler": "^4.10.0"
  }
}
```

## Related Documentation

- [OpenNext Cloudflare Docs](https://opennext.js.org/cloudflare)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Next.js on Workers](https://developers.cloudflare.com/workers/frameworks/framework-guides/nextjs/)
