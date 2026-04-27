import { SavedGlobalState } from 'client/modules/localstorage/globalState/SavedGlobalState';
import { cloneDeep } from 'lodash';

const DEFAULT_GLOBAL_STATE = Object.freeze<SavedGlobalState>({
  areCookiesAccepted: null,
  lastSelectedChainEnv: undefined,
  betaGatingBypass: undefined,
});

/**
 * Get global state with defaults applied
 * @param currentSaved The current saved global state, may be partial or undefined
 * @returns Complete global state object with defaults applied
 */
// See getUserStateWithDefaults for explanation of implementation
export function getGlobalStateWithDefaults(
  currentSaved: Partial<SavedGlobalState> | undefined,
): SavedGlobalState {
  const withDefaults: SavedGlobalState = {
    areCookiesAccepted:
      currentSaved?.areCookiesAccepted ??
      DEFAULT_GLOBAL_STATE.areCookiesAccepted,
    lastSelectedChainEnv:
      currentSaved?.lastSelectedChainEnv ??
      DEFAULT_GLOBAL_STATE.lastSelectedChainEnv,
    betaGatingBypass:
      currentSaved?.betaGatingBypass ?? DEFAULT_GLOBAL_STATE.betaGatingBypass,
  };

  return cloneDeep(withDefaults);
}
