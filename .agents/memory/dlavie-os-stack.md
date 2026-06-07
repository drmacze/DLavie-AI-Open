---
name: DLavie OS stack
description: Architecture decisions and gotchas for the DLavie OS AI IDE project
---

## WebGL / AuroraBackground
- Replit's preview iframe does NOT support WebGL — `THREE.WebGLRenderer` throws "Error creating WebGL context"
- **Fix**: detect WebGL availability with `canvas.getContext("webgl")` before mounting Three.js; fall back to CSS radial-gradient animation
- **How to apply**: always wrap WebGL init in try/catch and provide a CSS fallback component

## GSAP animation guards
- GSAP `.from(".class-name")` logs a warning if no matching elements exist in the DOM at call time
- **Fix**: use `containerRef.current.querySelectorAll(".class-name")` and check `cards.length > 0` before calling gsap.from
- **Why**: data-loaded pages (repos, docs, projects) render cards asynchronously; GSAP fires before React renders them

## Wouter Link — no nested `<a>`
- wouter's `<Link>` renders an `<a>` tag itself — wrapping content in another `<a>` causes React hydration warning
- **Fix**: pass `className` directly to `<Link>` and put content as children, never `<Link><a ...>...</a></Link>`
- **Why**: nested `<a>` is invalid HTML and causes React hydration errors

## Routes & DB
- messagesTable has no required FK to projects (projectId=0 for standalone chat)
- knowledge table created via raw SQL (pgvector enabled v0.8.0)
- GitHub token: GITHUB_PERSONAL_ACCESS_TOKEN env var
- node-llama-cpp and @octokit/rest must be externalized in api-server build.mjs
