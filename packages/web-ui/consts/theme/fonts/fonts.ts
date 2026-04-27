import { Inter } from 'next/font/google';
import localFont from 'next/font/local';

// Google Font
export const INTER = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
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
