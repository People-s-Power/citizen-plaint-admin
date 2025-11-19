import { atomWithStorage } from 'jotai/utils';

// Persist admin user data in localStorage
export const adminAtom = atomWithStorage('adminUser', null);
// This will store the authenticated admin user data and persist it

// Persist access level or permissions in localStorage
export const accessAtom = atomWithStorage('access', null);
// This will store the access level or permissions and persist it

