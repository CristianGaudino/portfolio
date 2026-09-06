/** "Now playing" from Spotify, and reading/watching/playing from a personal tracker. */

export type NowPlaying = {
    configured: boolean;
    playing: boolean;
    title?: string;
    artist?: string;
    url?: string;
    art?: string;
};

export type TrackedItem = {
    title: string;
    detail?: string;
    /** 0–100 */
    progress?: number;
};

/** Top-rated media of the last year, per category. Arrays — ties are all returned. */
export type Favourites = {
    album?: TrackedItem[];
    film?: TrackedItem[];
    series?: TrackedItem[];
    game?: TrackedItem[];
    book?: TrackedItem[];
};

export type TrackerStatus = {
    configured: boolean;
    reading?: TrackedItem;
    watching?: TrackedItem;
    playing?: TrackedItem;
    favourites?: Favourites;
};

export type SpotifyTop = {
    configured: boolean;
    artist?: string;
    artistUrl?: string;
};

export type PeerInfo = {
    available: boolean;
    city?: string | null;
    country?: string | null;
    km?: number | null;
};

export type DeployStatus = {
    configured: boolean;
    state?: string;
    at?: string;
    url?: string;
};

type SpotifyTrack = {
    name: string;
    external_urls?: { spotify?: string };
    artists?: { name: string }[];
    album?: { images?: { url: string }[] };
};

function spotifyConfigured() {
    return Boolean(
        process.env.SPOTIFY_CLIENT_ID &&
            process.env.SPOTIFY_CLIENT_SECRET &&
            process.env.SPOTIFY_REFRESH_TOKEN,
    );
}

/** Exchange the long-lived refresh token for a short-lived access token. */
async function spotifyAccessToken(): Promise<string | null> {
    const basic = Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
    ).toString('base64');

    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: process.env.SPOTIFY_REFRESH_TOKEN as string,
        }),
        cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { access_token?: string };
    return json.access_token ?? null;
}

function toNowPlaying(track: SpotifyTrack, playing: boolean): NowPlaying {
    return {
        configured: true,
        playing,
        title: track.name,
        artist: track.artists?.map((a) => a.name).join(', '),
        url: track.external_urls?.spotify,
        art: track.album?.images?.[0]?.url,
    };
}

export async function fetchNowPlaying(): Promise<NowPlaying> {
    if (!spotifyConfigured()) return { configured: false, playing: false };

    try {
        const token = await spotifyAccessToken();
        if (!token) return { configured: true, playing: false };
        const auth = { Authorization: `Bearer ${token}` };

        const current = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: auth,
            cache: 'no-store',
        });
        if (current.status === 200) {
            const json = (await current.json()) as {
                item?: SpotifyTrack;
                is_playing?: boolean;
                currently_playing_type?: string;
            };
            if (json.item && json.is_playing && json.currently_playing_type === 'track') {
                return toNowPlaying(json.item, true);
            }
        }

        return { configured: true, playing: false };
    } catch {
        return { configured: true, playing: false };
    }
}

export async function fetchTrackerStatus(): Promise<TrackerStatus> {
    const url = process.env.TRACKER_STATUS_URL;
    if (!url) return { configured: false };

    try {
        const res = await fetch(url, {
            next: { revalidate: 300 },
            headers: process.env.TRACKER_STATUS_TOKEN
                ? { Authorization: `Bearer ${process.env.TRACKER_STATUS_TOKEN}` }
                : {},
        });
        if (!res.ok) throw new Error(String(res.status));

        const json = (await res.json()) as Partial<TrackerStatus>;
        return {
            configured: true,
            reading: json.reading,
            watching: json.watching,
            playing: json.playing,
            favourites: json.favourites,
        };
    } catch {
        return { configured: false };
    }
}

/** Most-played artist on Spotify (long term). Needs the `user-top-read` scope. */
export async function fetchSpotifyTop(): Promise<SpotifyTop> {
    if (!spotifyConfigured()) return { configured: false };

    try {
        const token = await spotifyAccessToken();
        if (!token) return { configured: true };

        const res = await fetch('https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=1', {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });
        if (!res.ok) return { configured: true };

        const json = (await res.json()) as {
            items?: { name: string; external_urls?: { spotify?: string } }[];
        };
        const artist = json.items?.[0];
        return {
            configured: true,
            artist: artist?.name,
            artistUrl: artist?.external_urls?.spotify,
        };
    } catch {
        return { configured: true };
    }
}
