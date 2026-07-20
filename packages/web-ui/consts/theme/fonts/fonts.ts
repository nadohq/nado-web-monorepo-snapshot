import localFont from 'next/font/local';

// Local Font: Inter Variable
export const INTER = localFont({
  src: [
    {
      path: './Inter-Variable.woff2',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

// Local Font: Replica LL
export const REPLICA = localFont({
  src: [
    {
      path: './ReplicaLLWeb-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-replica',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

// Local Font: Replica Mono LL
export const REPLICA_MONO = localFont({
  src: [
    {
      path: './ReplicaMonoLLWeb-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-replica-mono',
  display: 'swap',
  fallback: ['monospace'],
});
