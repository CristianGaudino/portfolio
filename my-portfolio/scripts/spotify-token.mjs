/**
 * One-time helper: get a Spotify refresh token for the "now playing" widget.
 *
 *   1. Create an app at https://developer.spotify.com/dashboard
 *      and add redirect URI  http://127.0.0.1:8888/callback
 *   2. Put SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET in .env.local
 *      (or pass them as env vars when running this script)
 *   3. node scripts/spotify-token.mjs
 *   4. Approve in the browser; paste the printed refresh token into .env.local
 */
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';

const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = 'user-read-currently-playing user-read-recently-played user-top-read';

function loadEnvLocal() {
    try {
        for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
            const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
            if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
        }
    } catch {
        /* no .env.local — rely on real env vars */
    }
}

loadEnvLocal();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET (set them in .env.local).');
    process.exit(1);
}

const authUrl =
    'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: SCOPES,
        redirect_uri: REDIRECT_URI,
    });

const server = createServer(async (req, res) => {
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
    if (url.pathname !== '/callback') {
        res.writeHead(404).end();
        return;
    }

    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    if (error || !code) {
        res.writeHead(400).end(`Authorization failed: ${error ?? 'no code'}`);
        server.close();
        process.exit(1);
    }

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI }),
    });
    const json = await tokenRes.json();

    if (!json.refresh_token) {
        res.writeHead(500).end('No refresh token in response — check the console.');
        console.error(json);
        server.close();
        process.exit(1);
    }

    res.writeHead(200, { 'Content-Type': 'text/html' }).end(
        '<body style="font-family:system-ui;background:#1e1e1e;color:#d7cec7;padding:3rem">' +
            '<h2>Done — you can close this tab.</h2>' +
            '<p>The refresh token is in your terminal.</p></body>',
    );

    console.log('\n  SPOTIFY_REFRESH_TOKEN=' + json.refresh_token + '\n');
    console.log('  Paste that into .env.local (and the Vercel project env).\n');
    server.close();
    process.exit(0);
});

server.listen(PORT, '127.0.0.1', () => {
    console.log('\nOpening Spotify authorization in your browser...');
    console.log('If it does not open, visit:\n\n  ' + authUrl + '\n');
    const opener =
        process.platform === 'win32' ? ['cmd', ['/c', 'start', '', authUrl.toString()]]
        : process.platform === 'darwin' ? ['open', [authUrl.toString()]]
        : ['xdg-open', [authUrl.toString()]];
    try {
        spawn(opener[0], opener[1], { stdio: 'ignore', detached: true }).unref();
    } catch {
        /* user can open the URL manually */
    }
});
