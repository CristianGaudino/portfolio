import { ImageResponse } from 'next/og';

export const alt = 'Cristiano Gaudino — cgaudino.os';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#1e1e1e',
                    color: '#d7cec7',
                    padding: 72,
                }}
            >
                <div style={{ display: 'flex', gap: 10, marginBottom: 48 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 9999, background: '#ff7a7a' }} />
                    <div style={{ width: 16, height: 16, borderRadius: 9999, background: '#f2c265' }} />
                    <div style={{ width: 16, height: 16, borderRadius: 9999, background: '#6ee7a0' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ fontSize: 40, color: '#b7a2ff' }}>cgaudino.os</div>
                    <div style={{ fontSize: 88, fontWeight: 700, color: '#f8f6f3' }}>Cristiano Gaudino</div>
                    <div style={{ fontSize: 34, color: '#b8afa7' }}>
                        Irish software engineer — Next.js · TypeScript · Tailwind
                    </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', fontSize: 28 }}>
                    <span style={{ color: '#6ee7a0' }}>cristiano@cgaudino</span>
                    <span style={{ color: '#7d7bc4' }}>&nbsp;~ $ whoami</span>
                </div>
            </div>
        ),
        { ...size },
    );
}
