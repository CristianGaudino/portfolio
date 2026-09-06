/**
 * One-time helper: get a Spotify REFRESH TOKEN so the site can read your
 * listening data on your behalf.
 *
 * Why this exists: the Client ID + Secret only identify the *app*. To see
 * *your* now-playing / top artists, you have to approve the app once. That
 * approval hands back a long-lived "refresh token" the server keeps and uses
 * to fetch fresh access tokens forever — no login needed again.
 *
 *   1. Spotify app: add redirect URI  http://127.0.0.1:8888/callback
 *   2. Put these in my-portfolio/.env.local :
 *        SPOTIFY_CLIENT_ID=xxxxxxxx
 *        SPOTIFY_CLIENT_SECRET=xxxxxxxx
 *   3. From my-portfolio/ run:  node scripts/spotify-token.mjs
 *      (or pass them directly:  node scripts/spotify-token.mjs --id XXX --secret YYY)
 *   4. Approve in the browser, then paste the printed SPOTIFY_REFRESH_TOKEN
 *      into .env.local and the Vercel project env.
 */
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';

const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = 'user-read-currently-playing user-read-recently-played user-top-read';

/** Parse a .env file: handles `export `, quotes, `#` comments, `=` in values, CRLF, BOM. */
function parseEnvFile(url) {
    const out = {};
    let text;
    try {
        text = readFileSync(url, 'utf8');
    } catch {
        return out;
    }
    for (let line of text.replace(/^﻿/, '').split(/\r?\n/)) {
        line = line.trim();
        if (!line || line.startsWith('#')) continue;
        line = line.replace(/^export\s+/, '');
        const eq = line.indexOf('=');
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        let val = line.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        } else {
            val = val.replace(/\s+#.*$/, '').trim(); // strip trailing "# comment" on unquoted values
        }
        out[key] = val;
    }
    return out;
}

const args = process.argv.slice(2);
const argOf = (name) => {
    const i = args.indexOf(name);
    return i !== -1 ? args[i + 1] : undefined;
};

const fileEnv = {
    ...parseEnvFile(new URL('../.env', import.meta.url)),
    ...parseEnvFile(new URL('../.env.local', import.meta.url)),
};

const CLIENT_ID = argOf('--id') || process.env.SPOTIFY_CLIENT_ID || fileEnv.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = argOf('--secret') || process.env.SPOTIFY_CLIENT_SECRET || fileEnv.SPOTIFY_CLIENT_SECRET;

const mask = (v) => (v ? `${v.slice(0, 4)}…${v.slice(-2)} (${v.length} chars)` : 'NOT FOUND');
console.log('\n  SPOTIFY_CLIENT_ID     ' + mask(CLIENT_ID));
console.log('  SPOTIFY_CLIENT_SECRET ' + mask(CLIENT_SECRET) + '\n');

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error(
        'Could not find the credentials.\n' +
            '  · run this from the my-portfolio/ folder\n' +
            '  · .env.local should have lines like  SPOTIFY_CLIENT_ID=abcd1234  (no quotes needed)\n' +
            '  · or pass them:  node scripts/spotify-token.mjs --id <ID> --secret <SECRET>\n',
    );
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
    console.log('Trying to open Spotify authorization in your browser...');
    console.log('If nothing opens, copy this URL into your browser:\n\n  ' + authUrl + '\n');

    // NB: never route the URL through `cmd /c start` — cmd.exe splits it at every `&`.
    const url = authUrl.toString();
    const opener =
        process.platform === 'win32'
            ? ['rundll32', ['url.dll,FileProtocolHandler', url]]
            : process.platform === 'darwin'
              ? ['open', [url]]
              : ['xdg-open', [url]];
    try {
        spawn(opener[0], opener[1], { stdio: 'ignore', detached: true }).unref();
    } catch {
        /* fine — the URL is printed above */
    }
});
