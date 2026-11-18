# Storage (Cloudflare R2)

Uploads (photos, the host's music) and the curated music library live in a
Cloudflare R2 bucket. Server functions only sign upload URLs and record
metadata (`media_assets`); bytes never pass through a server function.

- On **Cloudflare Workers** (production) the Worker reaches the bucket
  through its `BUCKET` binding (`STORAGE_DRIVER=binding`): no S3 keys, no
  CORS rule. The browser PUTs to our own `/api/storage/upload` with an
  HMAC-signed URL; files are served from `R2_PUBLIC_URL` or, when it is
  unset, from `/api/storage/file/<key>`.
- On **Node** hosts R2 is spoken to through its S3-compatible endpoint,
  signed with [aws4fetch](https://github.com/mhart/aws4fetch) (no AWS SDK),
  and the browser uploads directly to R2 with a presigned URL
  (`STORAGE_DRIVER=r2`).

## Choosing the driver

| `STORAGE_DRIVER` | Behaviour                                                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `binding`        | R2 through the Worker's `BUCKET` binding (Workers only). Needs `STORAGE_SIGNING_SECRET` in production; `R2_PUBLIC_URL` optional; the other `R2_*` are ignored. |
| `r2`             | Cloudflare R2 over the S3 API (Node hosts). Startup fails, naming each missing `R2_*` variable, if any is empty.                                               |
| `local`          | `.storage/` on this machine. Development only; refused in production.                                                                                          |
| _(empty)_        | R2 (S3 API) when all five `R2_*` are set, else the binding when the Worker has one, else local in development. Setting only some `R2_*` fails at startup.      |

The editor header shows **Local storage (dev)** whenever uploads are going to
`.storage/`, so you always know which one is active.

Keys go in **`.env`** (git-ignored), never in `.env.example` (committed).

Leave the `R2_*` variables empty: the **local driver** stores files in
`.storage/` (git-ignored), signs uploads with HMAC (`STORAGE_SIGNING_SECRET`)
and serves them from `/api/storage/file/<key>` with HTTP Range support. It
refuses to run in production.

## The binding driver (Workers)

`src/server/storage/binding.server.ts`. The upload flow mirrors the local
driver, with the bucket instead of the disk:

1. `createUploadUrlFn` signs `PUT <APP_ORIGIN>/api/storage/upload?key&mime&bytes&exp&sig`
   (HMAC-SHA256 with `STORAGE_SIGNING_SECRET`, expiry ≤ 10 minutes).
2. The route (`src/server/storage/routes.server.ts`) checks the signature and
   expiry, that `Content-Type` equals the signed type, that the body is no
   larger than signed (and within the media policy), then `BUCKET.put`s it
   with its content type.
3. `confirmUploadFn` `head`s the object as before.

Media is addressed by key. An invitation saves each photo and audio file as
`{ assetKey, url }`, but the saved `url` is only a record of where the file
was served from at upload time. Whenever invitation data is sent to the
browser (public page, editor, dashboard), `withMediaUrls`
(`src/lib/media-urls.ts`) rebuilds every `url` from its key and the current
public address. Changing `R2_PUBLIC_URL`, or moving the files to another
bucket under the same keys, therefore moves every existing invitation with
no data migration. Sample photos in template defaults (`samples/…` keys)
are not in the bucket and are left as they are.

Reads: `publicUrl(key)` is `R2_PUBLIC_URL/<key>` when set (recommended:
enable public access on the bucket), otherwise `/api/storage/file/<key>`,
which streams from the binding with HTTP Range support. Setup:
`docs/DEPLOY.md`.

## Setting up R2

1. Cloudflare dashboard → R2 → **Create bucket** (e.g. `alikeni`).
2. Bucket → Settings → **Public access**: enable the `r2.dev` subdomain, or
   connect a custom domain (recommended for production, e.g. `media.alikeni.app`).
3. R2 → **Manage API tokens** → Create token with **Object Read & Write**,
   scoped to this bucket. Copy the Access Key ID and Secret Access Key.
4. Bucket → Settings → **CORS policy**:

   ```json
   [
     {
       "AllowedOrigins": [
         "http://localhost:3000",
         "https://your-domain.example"
       ],
       "AllowedMethods": ["PUT", "GET", "HEAD"],
       "AllowedHeaders": ["Content-Type"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

5. Fill `.env`:

   ```bash
   R2_ACCOUNT_ID=<account id from the R2 overview page>
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET=alikeni
   R2_PUBLIC_URL=https://pub-xxxx.r2.dev   # or your custom domain
   ```

When all five are set, `getStorage()` switches to R2 automatically.

## Object layout

| Prefix                                   | What                                  | Written by       |
| ---------------------------------------- | ------------------------------------- | ---------------- |
| `useruploads/<ownerId>/<uuid>.webp`      | Photos (resized client-side ≤ 800 KB) | editor uploads   |
| `useruploads/<ownerId>/<uuid>.mp3`       | Host music (≤ 10 MB)                  | editor uploads   |
| `library/<track>.mp3`                    | Curated music library                 | `pnpm music:add` |
| `album/<invitationId>/<uuid>.<ext>`      | Event album originals (see below)     | album uploads    |
| `album/<invitationId>/<uuid>.thumb.webp` | Album grid preview (≤ 400 KB)         | album uploads    |

Keys are owner-scoped: `confirmUpload` refuses keys outside the caller's
prefix, re-checks the real size and type with a HEAD request, and deletes
anything that breaks the rules. Presigned URLs expire after 10 minutes and
bind the Content-Type.

## Event album

`src/lib/album.ts` holds the rules, `src/server/album` the logic. A Premium
invitation can switch on an album at `/i/<slug>/album`: the host uploads at
any time, anyone with the link (plus the PIN, when set) from the first event
day until seven days after the last.

- **Originals are kept as uploaded**: photos ≤ 25 MB (JPEG, PNG, WebP,
  AVIF), videos ≤ 95 MB (MP4, MOV, WebM). The video limit is below
  Cloudflare's 100 MB request body limit because each file travels in one
  signed PUT; larger videos would need multipart uploads.
- **The upload route streams album files** to R2 (`putStream`) instead of
  buffering them, so a video does not sit in the Worker's memory.
- **Zip and folder uploads are opened in the browser** (`fflate`); the server
  only ever receives individual photos and videos.
- **What arrived is checked on confirm**: size, declared type and the file's
  first bytes (`sniffMedia`). A mismatch deletes the object.
- **Bulk approval**: a guest batch of more than 20 files is stored but hidden
  until the host approves it; rejected and unanswered (14 days, cron) batches
  are deleted from storage.
- **Limits per album**: 10 GB and 5,000 files.
- **PIN**: only a salted hash is stored. Media URLs are unguessable but not
  signed, so someone who was given a direct file link can open it without
  the PIN; the PIN protects the listing.
- With `R2_PUBLIC_URL` on another origin, "Download" and "Download all" need
  the bucket's CORS rule to allow `GET` from the site (see above).
