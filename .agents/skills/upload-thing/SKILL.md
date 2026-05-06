---
name: upload-thing
description: Integrates UploadThing for browser uploads with a split React (Vite) client and Express/NestJS API—file routers, createRouteHandler, typed React helpers, url/headers for presigned requests, CORS, and UPLOADTHING_TOKEN. Use when adding UploadThing, @uploadthing/react, file uploads, image uploaders, or UploadThing middleware.
---

# UploadThing (split frontend + API)

Official docs: [File routes](https://docs.uploadthing.com/file-routes), [Express adapter](https://docs.uploadthing.com/backend-adapters/express), [@uploadthing/react](https://docs.uploadthing.com/api-reference/react), [server API](https://docs.uploadthing.com/api-reference/server).

## Packages

- API: `uploadthing` → `uploadthing/express` (`createUploadthing`, `createRouteHandler`).
- Client: `@uploadthing/react` (`generateUploadButton`, `generateUploadDropzone`, `generateReactHelpers`).

Prefer generating components/helpers with your `FileRouter` type so endpoints and inputs stay type-safe.

## Environment

- Set `UPLOADTHING_TOKEN` on the **server** (dashboard token). This repo’s root `.env.example` already documents it.
- Never expose the token to the browser.

## Server: file router

Define routes with `createUploadthing()`, export a typed router and `OurFileRouter`:

```typescript
import { createUploadthing, type FileRouter } from "uploadthing/express";

const f = createUploadthing();

export const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } }).middleware(
    async ({ req, res }) => {
      // Optional: resolve user from JWT on req, throw if unauthorized
      return { userId: "…" };
    },
  ).onUploadComplete(async ({ metadata, file }) => {
    // Persist file.url / file.key as needed
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
```

Use `.input()` with a shared Zod (or server) validator when the client must send JSON alongside the upload; mirror that shape on the client `input` prop.

## Server: mount handler (Express)

Recommended mount path: `/api/uploadthing` (must match what the client uses in `url`).

```typescript
import express from "express";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing";

const app = express();
app.use(
  "/api/uploadthing",
  createRouteHandler({ router: uploadRouter /* , config: { ... } */ }),
);
```

Options and callbacks: [createRouteHandler](https://docs.uploadthing.com/api-reference/server#create-route-handler).

## Server: NestJS (Express platform)

Nest sits on Express: mount the same handler so all methods and subpaths under `/api/uploadthing` are handled by UploadThing. Typical pattern: a controller with `@All()` forwarding `req`/`res` to the handler returned by `createRouteHandler`, or register the middleware in `main.ts` on the underlying Express instance (`app.getHttpAdapter().getInstance()`). Keep one clear mount path; avoid duplicate global prefixes that double `/api`.

## Client: `url` when the API is separate

If the handler is **not** on the same origin as the Vite app, pass the full upload API URL into every generated helper ([Express adapter note](https://docs.uploadthing.com/backend-adapters/express)):

```typescript
const UPLOADTHING_URL = `${import.meta.env.VITE_API_URL}/api/uploadthing`;

export const UploadButton = generateUploadButton<OurFileRouter>({
  url: UPLOADTHING_URL,
});
export const UploadDropzone = generateUploadDropzone<OurFileRouter>({
  url: UPLOADTHING_URL,
});
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>({ url: UPLOADTHING_URL });
```

Enable **CORS** on the API for the Vite dev origin (and production web origin) so the browser can request presigned URLs.

## Client: auth headers

For JWT/session APIs, pass `headers` on components or `useUploadThing` so presign requests include `Authorization` ([props](https://docs.uploadthing.com/api-reference/react)). Use a function form if the token refreshes.

## Client: callbacks and UX

- `onClientUploadComplete`: runs after server `onUploadComplete`; response includes `url`, `key`, `name`, `size`, and `serverData` if `awaitServerData` is configured.
- `onUploadError` / `onUploadAborted` (v6.7+): handle failures and aborts.
- `onUploadProgress`, `uploadProgressGranularity`: progress UI.
- `onBeforeUploadBegin`: rename or preprocess `File[]` before upload.
- Deprecated: `generateComponents` — use `generateUploadButton` + `generateUploadDropzone` separately ([react docs](https://docs.uploadthing.com/api-reference/react)).

## Shared types

Put `OurFileRouter` (or a type-only re-export) in a package or path both `apps/api` and `apps/client` can import so generics on `generateUploadButton<OurFileRouter>` stay accurate without duplicating route names.

## Production checklist

- Token only on server; correct `url` in prod.
- CORS and HTTPS.
- `onUploadComplete` is the right place to write to DB; treat `file.url` as the public file URL unless using private files / ACL patterns from UploadThing docs.

## Further reading

- [Authentication & security](https://docs.uploadthing.com/guides/authentication-security)
- [Error handling](https://docs.uploadthing.com/guides/error-handling)
- [Theming / Tailwind `config.cn`](https://docs.uploadthing.com/guides/theming)
