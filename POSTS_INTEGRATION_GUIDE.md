# Summit — Posts backend and image integration

## Scope / safety

Apply these files only to a **new branch based on the same `sprint-two` snapshot** as the uploaded zip. The existing authentication implementation, unrelated screens, and community API behavior are not rewritten. The original local-only `summitPostsService.ts` and its unit tests remain in the repository; `SummitPostsScreen` now selects the new network-backed service instead.

These changes were syntax-checked but **not fully compiled or integration-tested in this environment** because a complete npm dependency installation was unavailable. Run the tests below before merging. Do not blindly overwrite newer team changes; inspect `git diff` before committing.

## Branch

```powershell
git fetch origin
git switch sprint-two
git pull --ff-only origin sprint-two
git switch -c feature/posts-backend-image-integration
```

Unpack the supplied **changed-files.zip** into the root of your local `summit` repository (the folder containing `compose.yaml`), preserving paths. Then inspect `git status` and `git diff`.

## Device/database setup

**One host, many clients.** On Laptop A (the chosen host), start Docker and the API; this creates/uses local persistent `summit_postgres_data` and `summit_post_images` Docker volumes. On Laptop B, **do not start another independent database** if you want both users to see A's posts. Start only the Expo app and direct its `EXPO_PUBLIC_API_URL` to Laptop A's LAN IP and the server's published port (normally 3000). Both devices must reach each other over Wi-Fi/LAN, the host firewall must allow the API port, and both must use the same server.

If Laptop B is the host instead, use B's server IP on both clients. Moving to a different host with an empty database does not migrate or sync old posts; that requires transferring the Docker volumes/data or introducing a centralized server/sync design.

**Server `.env`** at repository root is still required; configure as in `.env.example`. **Mobile `.env`** inside `app/mobile` must contain for example:

```dotenv
EXPO_PUBLIC_API_URL=http://192.168.1.157:3000
```

Replace the IP with the actual **server-host** LAN IPv4 address, not the phone IP. Avoid `localhost` on a second device. Restart Expo after changing the `.env`. Keep credentials/JWT secret out of version control.

## Run on the hosting laptop

```powershell
cd "C:\Users\Ayman\Documents\GitHub\summit"
docker compose up -d --build
docker compose ps
docker compose logs --tail=60 server
```

The current Docker development command runs `prisma generate` and `prisma db push`, which should add the new nullable post-image columns. Back up any important database first. The image files are stored in the `summit_post_images` Docker volume, and the database records/image metadata in `summit_postgres_data`. **Do not run `docker compose down -v`** unless intentionally deleting local data. Ordinary `docker compose down` preserves named volumes.

On **each** laptop running Expo, rebuild the changed shared contracts before launching the app:

```powershell
cd "C:\Users\Ayman\Documents\GitHub\summit\app\shared"
npm install
npm run build
cd ..\mobile
npm install
npx expo start --lan --clear
```

The host laptop can also run Expo; both Expo devices point at the same host server.

## Tests (before merging)

```powershell
# From repository root; after containers are healthy:
docker compose exec server sh -lc "NODE_ENV=test npx tsx --test tests/integration/posts-images-shared-feed.api.test.ts"
# Existing backend integration suite:
docker compose exec server npm run test:integration
# Existing mobile checks:
cd app\mobile
npm run typecheck
npm run test:posts
```

If the backend container's `NODE_ENV=test` affects an existing test suite, use an isolated test database instead of the shared developer database. Existing tests already create sample users/posts. Review the Docker logs for any generated Prisma or database errors before testing.

## Expected behavior

- A logged-in user can create, edit, delete and vote on posts. The server enforces author ownership.
- Users on both clients see the shared chronological post feed; the screen checks for new posts and replies every 15 seconds and allows pull-to-refresh on the feed.
- Comments, comment edits, deletes and votes use the backend; all users read the same discussion.
- JPEG, PNG and WebP photos (up to 5 MiB) upload to the host server and persist in a Docker volume. The database stores the image path and dimensions. HEIC or other formats must first be converted to one of the supported types.
- Users can sign out and sign in as another account on the same device; previous posts remain in the server database. Two *simultaneous* accounts in one Expo app instance are not supported.
- Usernames are supplied by the API and both post cards and avatars guard against missing names.
- `app/shared/src/posts` is extended with **optional** response image/author/community/count fields and optional update fields. `app/shared/src/comments` gains an optional username field. Existing contract fields are preserved.

## Known limitations

- There is no automatic synchronization between **separate** local PostgreSQL instances; use one reachable API/database per shared feed.
- The image-upload endpoint writes the image before its post is created. If post creation fails, the uploaded file may remain; images are not garbage-collected on post deletion/edit. Plan cleanup later.
- New posts use the first 160 characters of the body (or `Photo`) as the existing backend's required title. The visible card remains body/photo-oriented.
- The current backend comment contract has no `updatedAt`, so an edited comment may not display the previous local-only "edited" label after reloading.
- Web-browser Expo deployments may require CORS configuration on the server; Expo native clients on a LAN do not.
- Backward compatibility does not equal a guarantee: verify the branch with backend + mobile tests before opening a PR.
