export type DataEnv = 'local' | 'nadoTestnet' | 'nadoMainnet';

export interface BaseClientEnv {
  // Determines supported chains to interact with
  dataEnv: DataEnv;
  // Enables any WIP / experimental features
  enableExperimentalFeatures: boolean;
  // Enables beta gating
  enableBetaGating: boolean;
  // An identifier for the current build
  buildId: string;
}

const dataEnv: DataEnv =
  (process.env.NEXT_PUBLIC_DATA_ENV as DataEnv) ?? 'nadoTestnet';

export const baseClientEnv: BaseClientEnv = {
  enableExperimentalFeatures:
    process.env.NEXT_PUBLIC_ENABLE_EXPERIMENTAL_FEATURES === 'true',
  dataEnv,
  buildId: process.env.NEXT_PUBLIC_BUILD_ID ?? 'dev',
  enableBetaGating: process.env.NEXT_PUBLIC_ENABLE_BETA_GATING === 'true',
};
