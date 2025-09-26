import { atomWithStorage } from 'jotai/utils';

// Persist admin user data in localStorage
export const adminAtom = atomWithStorage('adminUser', null);
// This will store the authenticated admin user data and persist it
