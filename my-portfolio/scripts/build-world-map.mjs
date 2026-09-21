// One-off generator: TopoJSON (world-atlas, 50m) -> flat SVG path data for the travel atlas.
// Run with: node scripts/build-world-map.mjs
//
// Pipeline:
//   1. 50m resolution (not 110m) — 110m silently drops small-but-real countries (Malta, Singapore, ...).
//   2. topojson-simplify reduces point density ~9x (topology-aware, so shared borders between
//      neighbours stay in sync — no seams) down to roughly 110m's point count, keeping all 234 countries.
//      Small countries (Malta, Singapore, ...) can collapse to a degenerate zero-area shape under this —
//      any country whose simplified bbox is smaller than MIN_SHAPE_UNITS falls back to its unsimplified
//      geometry instead, so nothing on your actual travel/bucket lists disappears.
//   3. Features are merged by resolved ISO alpha-2 code — some countries (e.g. Australia +
//      "Ashmore and Cartier Is.") are split across multiple raw features sharing one ISO code;
//      without merging this produces duplicate React keys downstream.
//   4. A small MAINLAND_ONLY allowlist drops a country's far-flung overseas-territory rings
//      (France's polygon otherwise includes French Guiana, Réunion, Martinique, ...).
//   5. Projected with a Gall-Peters (cylindrical equal-area, standard parallel 45°) projection,
//      so relative country *sizes* are geographically correct — not Mercator/equirectangular's
//      "Greenland the size of Africa" distortion.
//
// Two outputs, split so the heavy path data never has to load unless the atlas is opened:
//   src/lib/world-map-paths.json — [{ code, name, d }]      (lazy-loaded with WorldMap)
//   src/lib/world-map-geo.json   — [{ code, lon, lat }]     (tiny, always bundled — travel.ts's haversine stat)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { feature } from 'topojson-client';
import { presimplify, simplify, quantile } from 'topojson-simplify';
import iso from 'iso-3166-1';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const rawTopology = JSON.parse(
    readFileSync(path.join(root, 'node_modules/world-atlas/countries-50m.json'), 'utf8'),
);

const SIMPLIFY_QUANTILE = 0.05; // empirically ~11k points total (vs ~100k raw, ~10.5k at 110m)
const presimplified = presimplify(JSON.parse(JSON.stringify(rawTopology)));
const simplifiedTopology = simplify(presimplified, quantile(presimplified, SIMPLIFY_QUANTILE));

// Countries whose Natural Earth polygon bundles in overseas territories we don't want by default.
const MAINLAND_ONLY = {
    FR: { lonMin: -6, lonMax: 10, latMin: 40, latMax: 52 }, // metropolitan France + Corsica
};

const W = 960;
const H = 460;
const LAT_MAX = 84;
const LAT_MIN = -58;

// Gall-Peters: cylindrical equal-area projection, standard parallel 45°.
// Preserves relative country AREA (unlike the plain equirectangular projection this replaces).
const PHI0 = Math.PI / 4;
const COS_PHI0 = Math.cos(PHI0);
const toRad = (d) => (d * Math.PI) / 180;
const X_RAW_MAX = Math.PI * COS_PHI0;
const Y_RAW_MAX = Math.sin(toRad(LAT_MAX)) / COS_PHI0;
const Y_RAW_MIN = Math.sin(toRad(LAT_MIN)) / COS_PHI0;

const round = (n) => Math.round(n * 100) / 100; // 2dp — 1dp was coarse enough to collapse tiny islands to a point

function project([lon, lat]) {
    const xRaw = toRad(lon) * COS_PHI0;
    const yRaw = Math.sin(toRad(lat)) / COS_PHI0;
    const x = ((xRaw + X_RAW_MAX) / (2 * X_RAW_MAX)) * W;
    const y = ((Y_RAW_MAX - yRaw) / (Y_RAW_MAX - Y_RAW_MIN)) * H;
    return [round(x), round(y)];
}

// Countries whose coastline crosses the antimeridian (Russia, Fiji, ...) otherwise get a ring
// point that jumps from lon≈180 to lon≈-180 — in this flat projection that draws a straight line
// clean across the entire map. Split the ring wherever a step is bigger than a real border segment
// could be; each piece renders (and self-closes) separately instead of connecting across the map.
function splitAtAntimeridian(ring) {
    const pieces = [];
    let current = [ring[0]];
    for (let i = 1; i < ring.length; i++) {
        if (Math.abs(ring[i][0] - ring[i - 1][0]) > 180) {
            pieces.push(current);
            current = [];
        }
        current.push(ring[i]);
    }
    pieces.push(current);
    return pieces.filter((p) => p.length > 1);
}

function ringToPath(ring) {
    return splitAtAntimeridian(ring)
        .map(
            (piece) =>
                piece
                    .map(project)
                    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`)
                    .join(' ') + ' Z',
        )
        .join(' ');
}

/** Bounding box of a set of polygons, in PROJECTED (pixel/viewBox) space. */
function projectedBBox(polys) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const poly of polys) {
        for (const ring of poly) {
            for (const pt of ring) {
                const [x, y] = project(pt);
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }
    return { width: maxX - minX, height: maxY - minY };
}

function ringBBox(ring) {
    let lonMin = Infinity, lonMax = -Infinity, latMin = Infinity, latMax = -Infinity;
    for (const [lon, lat] of ring) {
        if (lon < lonMin) lonMin = lon;
        if (lon > lonMax) lonMax = lon;
        if (lat < latMin) latMin = lat;
        if (lat > latMax) latMax = lat;
    }
    return { lonMin, lonMax, latMin, latMax };
}

function overlaps(box, allow) {
    return box.lonMax >= allow.lonMin && box.lonMin <= allow.lonMax && box.latMax >= allow.latMin && box.latMin <= allow.latMax;
}

function centroidOf(polys) {
    let sx = 0, sy = 0, n = 0;
    for (const poly of polys) {
        for (const [lon, lat] of poly[0]) {
            sx += lon;
            sy += lat;
            n++;
        }
    }
    return [round(sx / n), round(sy / n)];
}

/** country code -> { name, polys } for every recognised, non-Antarctica feature in a topology. */
function extractByCode(topology) {
    const collection = feature(topology, topology.objects.countries);
    const byCode = new Map();
    const skipped = [];
    for (const f of collection.features) {
        if (f.id === '010') continue; // Antarctica
        const match = iso.whereNumeric(f.id);
        if (!match) {
            skipped.push(f.properties?.name ?? f.id);
            continue;
        }
        const geom = f.geometry;
        let polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];

        const allow = MAINLAND_ONLY[match.alpha2];
        if (allow) polys = polys.filter((poly) => overlaps(ringBBox(poly[0]), allow));
        if (!polys.length) continue;

        const entry = byCode.get(match.alpha2) ?? { name: match.country, polys: [] };
        entry.polys.push(...polys);
        byCode.set(match.alpha2, entry);
    }
    return { byCode, skipped };
}

const { byCode: simplifiedByCode } = extractByCode(simplifiedTopology);
const { byCode: rawByCode, skipped } = extractByCode(rawTopology);

const MIN_SHAPE_UNITS = 2; // simplified shapes smaller than this (out of a 960-wide map) fall back to unsimplified geometry
let fellBackCount = 0;

const paths = [];
const geo = [];
for (const [code, simpEntry] of simplifiedByCode) {
    let { polys } = simpEntry;
    const box = projectedBBox(polys);
    if (box.width < MIN_SHAPE_UNITS || box.height < MIN_SHAPE_UNITS) {
        const rawEntry = rawByCode.get(code);
        if (rawEntry) {
            polys = rawEntry.polys;
            fellBackCount++;
        }
    }

    const d = polys.map((poly) => poly.map(ringToPath).join(' ')).join(' ');
    const [lon, lat] = centroidOf(polys);
    paths.push({ code, name: simpEntry.name, d });
    geo.push({ code, lon, lat });
}

paths.sort((a, b) => a.name.localeCompare(b.name));
geo.sort((a, b) => a.code.localeCompare(b.code));

writeFileSync(
    path.join(root, 'src/lib/world-map-paths.json'),
    JSON.stringify({ width: W, height: H, countries: paths }),
);
writeFileSync(path.join(root, 'src/lib/world-map-geo.json'), JSON.stringify(geo));

const totalPoints = paths.reduce((n, p) => n + (p.d.match(/[ML]/g)?.length ?? 0), 0);
console.log(
    `wrote ${paths.length} countries (${totalPoints} path points, ${fellBackCount} kept at full detail for being too small when simplified), skipped ${skipped.length}:`,
    skipped.join(', '),
);
