/**
 * Formats system and authentication errors into clean, professional, enterprise-grade messages.
 * Completely suppresses raw framework names (e.g. Firebase, AI Studio, etc.).
 */

export function formatUserError(err: unknown): string {
  if (!err) return 'An unexpected error occurred. Please try again.';

  let rawMessage = '';
  let code = '';

  if (typeof err === 'string') {
    rawMessage = err;
  } else if (err && typeof err === 'object') {
    const errorObj = err as any;
    rawMessage = errorObj.message || errorObj.error || String(err);
    code = errorObj.code || '';
  } else {
    rawMessage = String(err);
  }

  // Parse JSON if handleFirestoreError threw a JSON string
  if (rawMessage.startsWith('{') && rawMessage.endsWith('}')) {
    try {
      const parsed = JSON.parse(rawMessage);
      if (parsed.error) rawMessage = parsed.error;
    } catch {
      // ignore JSON parse failure
    }
  }

  // Check specific Auth Error Codes / Snippets
  if (code === 'auth/popup-closed-by-user' || rawMessage.includes('popup-closed-by-user')) {
    return 'Authentication window was closed before completion. Please try again.';
  }
  if (code === 'auth/popup-blocked' || rawMessage.includes('popup-blocked')) {
    return 'Authentication popup was blocked by your browser settings. Please enable popups for this site.';
  }
  if (code === 'auth/cancelled-popup-request' || rawMessage.includes('cancelled-popup-request')) {
    return 'Authentication process was superseded. Please try again.';
  }
  if (code === 'auth/user-not-found' || rawMessage.includes('user-not-found')) {
    return 'No account was found matching this email address.';
  }
  if (code === 'auth/wrong-password' || rawMessage.includes('wrong-password')) {
    return 'Incorrect password. Please verify your credentials and try again.';
  }
  if (code === 'auth/invalid-credential' || rawMessage.includes('invalid-credential')) {
    return 'Invalid credentials provided. Please double-check your email and password.';
  }
  if (code === 'auth/email-already-in-use' || rawMessage.includes('email-already-in-use')) {
    return 'An account with this email address already exists. Please sign in instead.';
  }
  if (code === 'auth/weak-password' || rawMessage.includes('weak-password')) {
    return 'Password is too weak. Please use at least 6 characters with numbers or symbols.';
  }
  if (code === 'auth/invalid-email' || rawMessage.includes('invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/too-many-requests' || rawMessage.includes('too-many-requests')) {
    return 'Access temporarily paused due to multiple unsuccessful attempts. Please try again later.';
  }
  if (code === 'auth/network-request-failed' || rawMessage.includes('network-request-failed')) {
    return 'Network connection error. Please verify your internet connection and retry.';
  }

  // General Sanitize regex for any leftover technical terms
  let sanitized = rawMessage
    .replace(/Firebase:\s*/gi, '')
    .replace(/Error\s*\(auth\/[^)]+\)\.?/gi, '')
    .replace(/\bFirebase\b/gi, 'Authentication')
    .replace(/\bFirestore\b/gi, 'Database')
    .replace(/\bGoogle AI Studio\b/gi, 'Kogla Platform')
    .replace(/\bAI Studio\b/gi, 'Kogla Platform')
    .replace(/\bapplet\b/gi, 'system')
    .trim();

  if (!sanitized || sanitized === '.' || sanitized.length < 3) {
    return 'An error occurred during operation. Please try again or contact support.';
  }

  return sanitized;
}
