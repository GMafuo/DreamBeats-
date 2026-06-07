import { useContext } from 'react';
import { AppContext } from './contextStore';

export const useAppContext = () => useContext(AppContext);
