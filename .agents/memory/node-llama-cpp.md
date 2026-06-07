---
name: node-llama-cpp setup
description: How node-llama-cpp is set up in DLavie OS — version, model path, build config
---

## Version
node-llama-cpp v3.18.1 (installed in api-server)

## Model
- Downloaded: Qwen2.5-Coder-1.5B-Instruct Q4_K_M (~941 MB)
- Path: `~/.dlavie-models/` (persists across restarts, not in workspace)

## Build config
- Must be listed in `external` array in `artifacts/api-server/build.mjs` to prevent esbuild from trying to bundle native bindings
- Same for `@octokit/rest`

**Why**: esbuild cannot handle native .node addons; externalizing lets Node resolve them at runtime from node_modules
