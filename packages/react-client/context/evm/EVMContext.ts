import { createContext } from 'react';
import { useRequiredContext } from '../../hooks/useRequiredContext';
import { EVMContextData } from './types';

export const EVMContext = createContext<EVMContextData | null>(null);

export const useEVMContext = () => useRequiredContext(EVMContext);
