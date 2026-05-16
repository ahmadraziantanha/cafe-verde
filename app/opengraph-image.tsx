import { ImageResponse } from 'next/og';

export const alt = 'Cafe Verde — Considered coffee, honest food.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const runtime = 'edge';

// Fetch the font once at the CSS endpoint, then grab the embedded .woff2 URL.
// This pattern works reliably across @vercel/og versions because we always
// get a fresh, valid font URL from Google.
async function googleFont(family: string, weight = 400, italic = false): Promise<ArrayBuffer> {
  const ital = italic ? 'ital,wght@1,' : 'wght@';
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:${ital}${weight}&display=swap`,
    { headers: { 'User-Agent': 'Mozilla/5.0' } },
  ).then((r) => r.text());
  const match = css.match(/src: url\(([^)]+)\) format\('(woff2|truetype)'\)/);
  if (!match) throw new Error(`Could not parse font URL for ${family}`);
  return fetch(match[1]).then((r) => r.arrayBuffer());
}

export default async function OG() {
  const [serif, serifItalic, sans] = await Promise.all([
    googleFont('Playfair+Display', 600, false),
    googleFont('Playfair+Display', 400, true),
    googleFont('Inter', 400, false),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background:
            'linear-gradient(135deg, #1F4A2E 0%, #2D5F3F 55%, #4A7B5C 100%)',
          color: '#FAF6EE',
          fontFamily: '"Inter"',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -120,
            right: -120,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: 'rgba(250, 246, 238, 0.06)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -180,
            left: -100,
            width: 360,
            height: 360,
            borderRadius: 999,
            background: 'rgba(250, 246, 238, 0.05)',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontSize: 18,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: 'rgba(250, 246, 238, 0.85)',
          }}
        >
          <div style={{ width: 56, height: 1, background: 'rgba(250, 246, 238, 0.55)' }} />
          Est. 2024 · Brooklyn, NY
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 40 }}>
          <div
            style={{
              fontFamily: '"Playfair"',
              fontSize: 168,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              fontWeight: 600,
            }}
          >
            Cafe
          </div>
          <div
            style={{
              fontFamily: '"Playfair"',
              fontSize: 168,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              fontStyle: 'italic',
              fontWeight: 400,
              color: 'rgba(250, 246, 238, 0.96)',
              marginTop: -8,
            }}
          >
            Verde
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{
              fontSize: 26,
              color: 'rgba(250, 246, 238, 0.92)',
              fontWeight: 400,
              maxWidth: 620,
              lineHeight: 1.4,
            }}
          >
            A quiet corner for considered coffee and honest food.
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: 16,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: 'rgba(250, 246, 238, 0.7)',
            }}
          >
            cafeverde.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Playfair', data: serif, style: 'normal', weight: 600 },
        { name: 'Playfair', data: serifItalic, style: 'italic', weight: 400 },
        { name: 'Inter', data: sans, style: 'normal', weight: 400 },
      ],
    },
  );
}
