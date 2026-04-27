import { baseClientEnv, BaseClientEnv } from 'common/environment/baseClientEnv';

export interface ClientEnv {
  base: BaseClientEnv;
  isTestnetDataEnv: boolean;
}

const isTestnetDataEnv = {
  local: true,
  nadoTestnet: true,
  nadoMainnet: false,
}[baseClientEnv.dataEnv];

export const clientEnv: ClientEnv = {
  base: baseClientEnv,
  isTestnetDataEnv,
};
