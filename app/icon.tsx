import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';
export const runtime = 'edge';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#2D5F3F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FAF6EE',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '-1px',
          borderRadius: 6,
        }}
      >
        V
      </div>
    ),
    { ...size },
  );
}
