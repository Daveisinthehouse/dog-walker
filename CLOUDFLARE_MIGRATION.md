# Move Dog Walker leaderboard to Cloudflare D1

The game is still using Supabase until the Cloudflare Worker is deployed and its URL is added to `index.html`. Do not delete or pause the Supabase project yet.

## 1. Create the free D1 database

1. Sign in at https://dash.cloudflare.com/
2. Open **Storage & databases → D1 SQL Database** (the exact menu wording may vary).
3. Create a database named `dog-walker-scores`.
4. Copy the database ID shown in its details.
5. Open the database's SQL/Console area and run the contents of `worker/schema.sql`.

## 2. Connect this GitHub repository to a Worker

1. In Cloudflare, open **Workers & Pages** and create a Worker connected to the GitHub repository `Daveisinthehouse/dog-walker`.
2. Ensure the deployment uses the repository's `wrangler.toml`.
3. Edit `wrangler.toml` in GitHub and replace `REPLACE_WITH_YOUR_D1_DATABASE_ID` with the D1 database ID from step 1.
4. Commit the change and wait for the Worker deployment to succeed.
5. In the Worker settings, confirm the D1 binding is named **DB** and points to `dog-walker-scores`.
6. Copy the Worker URL, which will look similar to `https://dog-walker-leaderboard.<your-subdomain>.workers.dev`.

## 3. Finish switching the game

The Worker has two endpoints:
- `GET /api/leaderboard` — returns the top 10 scores.
- `POST /api/scores` — accepts JSON like `{"player_name":"Player","score":123}`.

Send me the exact Worker URL from step 6. I can then update the game's existing score-fetch and score-submit functions, test the JavaScript, and commit the frontend switch. Until that is done, the live game will continue to use Supabase.

## Important

- Keep Supabase intact until the Cloudflare leaderboard is working and any existing scores have been copied.
- The Supabase project is currently reporting a `COMING_UP` status through its management API, and its table list is not yet available. I have not confirmed whether existing scores can be exported.
- This Worker validates names and score ranges, but a public game can still receive fabricated scores. Stronger anti-cheat/rate limiting can be added after the basic migration works.
