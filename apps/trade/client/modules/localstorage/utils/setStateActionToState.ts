import { cloneDeep } from 'lodash';
import { SetStateAction } from 'react';

export function setStateActionToState<T>(
  prev: T,
  setState: SetStateAction<T>,
): T {
  const newState = setState instanceof Function ? setState(prev) : setState;
  return cloneDeep(newState);
}
