import { SENSITIVE_DATA } from 'common/environment/sensitiveData';

const envName = process.env.NEXT_PUBLIC_SENTRY_ENV_NAME ?? 'local';
const enabled = ['production', 'staging'].includes(envName);

export const sentryEnv = {
  dsn: SENSITIVE_DATA.sentryDsn,
  envName,
  enabled,
};
