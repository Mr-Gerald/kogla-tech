// Firebase has been completely migrated to Supabase as requested.
// This file is retained as a zero-op stub to prevent build breakages.
export const db = null as any;
export const auth = null as any;
export const safeFirestoreWrite = async (fn: () => Promise<any>) => { try { return await fn(); } catch (_) { return null; } };
export const safeFirestoreRead = async (fn: () => Promise<any>, fallback: any) => { try { return await fn(); } catch (_) { return fallback; } };
export const handleFirestoreError = () => {};
export enum OperationType { READ = 'read', WRITE = 'write', DELETE = 'delete' }
