# DJ CLASS OBS Overlay - Cloudflare Deployment Guide

This project has been refactored to deploy on **Cloudflare Pages** using the official `@cloudflare/next-on-pages` integration.

## Prerequisites

1. [Node.js](https://nodejs.org/) (v18 or later)
2. A Cloudflare account
3. Git repository (for automatic deployments)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Local Development

Run the Next.js development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Deployment Options

### Option 1: Cloudflare Pages with Git Integration (Recommended)

This is the easiest and most reliable method.

1. **Push your code to a Git repository** (GitHub, GitLab, or Bitbucket)

2. **Connect to Cloudflare Pages**:
   - Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Go to **Pages** → **Create a project**
   - Connect your Git repository
   - Configure build settings:
     - **Build command**: `npx @cloudflare/next-on-pages`
     - **Build output directory**: `.vercel/output/static`
   - Click **Save and Deploy**

3. **Environment Variables** (if needed):
   - Go to your Pages project → Settings → Environment Variables
   - Add any required variables

### Option 2: Wrangler CLI (Mac/Linux/WSL)

For local builds and deployment using the Wrangler CLI:

**Note**: `@cloudflare/next-on-pages` requires a Unix-like environment. On Windows, use WSL2.

```bash
# Build for Cloudflare
npm run cf:build

# Preview locally
npm run cf:dev

# Deploy to Cloudflare
npm run cf:deploy
```

### Option 3: Manual Upload

1. Build the project on a system that supports `@cloudflare/next-on-pages`:
   ```bash
   npx @cloudflare/next-on-pages
   ```

2. Upload the `.vercel/output/static` directory via the Cloudflare Dashboard:
   - Go to Pages → Create a project → Direct upload
   - Upload the build directory

## Project Structure

```
djclass-overlay/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main page (URL generator)
│   ├── page.module.css    # Main page styles
│   ├── globals.css        # Global styles
│   ├── not-found.tsx      # 404 page
│   ├── api/
│   │   └── djclass/
│   │       └── route.ts   # API route (Edge runtime)
│   └── overlay/
│       ├── page.tsx       # OBS overlay page
│       └── overlay.module.css  # Overlay styles
├── .next/                 # Next.js build output (local dev)
├── .vercel/output/static  # Cloudflare Pages build output
├── wrangler.toml          # Cloudflare configuration
├── next.config.ts         # Next.js configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

## Configuration Files

### wrangler.toml

Configuration for Cloudflare Pages deployment:
- Compatibility date: 2025-04-10
- Node.js compatibility enabled
- Observability enabled

### next.config.ts

Next.js configuration optimized for Cloudflare:
- Trailing slashes enabled
- Custom headers for OBS compatibility
- Image optimization disabled (optional)

### API Routes

The API route (`/api/djclass`) uses the **Edge Runtime** (`export const runtime = 'edge'`) for optimal performance on Cloudflare's global network.

## Environment Variables

Create a `.env.local` file for local development:

```bash
# Copy the example file
cp .env.example .env.local

# Edit with your values
```

For production, set environment variables in the Cloudflare Dashboard:
1. Go to your Pages project
2. Navigate to Settings → Environment Variables
3. Add your variables

## Features

- **Main Page**: Generate overlay URLs with username and button mode selection
- **Overlay Page**: Transparent OBS overlay displaying DJ CLASS information
- **API Route**: Proxy to V-Archive API with Edge runtime optimization
- **Automatic Updates**: Polling every 30 seconds
- **Animated Display**: Smooth number animations when points change

## Usage

### Generating an Overlay URL

1. Visit the main page of your deployed application
2. Enter your V-Archive username
3. Select a button mode (4B, 5B, 6B, or 8B)
4. Click "Generate Overlay URL"
5. Copy the generated URL

### Using in OBS

1. In OBS Studio, click the **+** button in the Sources panel
2. Select **Browser** source
3. Name your source and click OK
4. Paste the overlay URL in the URL field
5. Set Width to **400** and Height to **200** (adjust as needed)
6. Click OK to add the overlay

## Troubleshooting

### Build Errors

If you encounter build errors:
1. Ensure all dependencies are installed: `npm install`
2. Check TypeScript types: `npm run typecheck`
3. Use Node.js v18 or later: `node --version`

### Windows Build Issues

`@cloudflare/next-on-pages` requires a Unix-like environment. On Windows:
- Use **WSL2** (Windows Subsystem for Linux)
- Or use the Git integration method (recommended)
- Or build on a CI/CD pipeline (GitHub Actions, etc.)

### API Route Issues

The API route uses Edge Runtime. Ensure:
- No Node.js-specific APIs are used (fs, path, etc.)
- All fetch calls use standard Web APIs

### CORS Issues

If the overlay doesn't load in OBS:
- Check that the `X-Frame-Options` header is set to `ALLOWALL`
- Verify `Access-Control-Allow-Origin` is set to `*`
- These headers are configured in `next.config.ts`

## Development Commands

```bash
# Start development server
npm run dev

# Build locally
npm run build

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Cloudflare-Specific Commands

```bash
# Build for Cloudflare (requires Unix-like environment)
npm run cf:build

# Preview locally with Wrangler
npm run cf:dev

# Deploy to Cloudflare
npm run cf:deploy
```

## Custom Domain

To use a custom domain:
1. Go to your Pages project in the Cloudflare Dashboard
2. Click **Custom domains**
3. Click **Set up a custom domain**
4. Enter your domain and follow the setup process

## Learn More

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

## License

MIT
