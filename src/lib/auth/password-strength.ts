export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number;
  checks: {
    hasMinLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
  requirements: string[];
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  let score = 0;
  if (checks.hasMinLength) score += 1;
  if (checks.hasUpperCase) score += 1;
  if (checks.hasLowerCase) score += 1;
  if (checks.hasNumber) score += 1;
  if (checks.hasSpecialChar) score += 1;
  if (password.length >= 12) score += 1;

  let strength: PasswordStrength;
  if (score <= 2) strength = 'weak';
  else if (score === 3) strength = 'fair';
  else if (score === 4) strength = 'good';
  else strength = 'strong';

  const requirements: string[] = [];
  if (!checks.hasMinLength) requirements.push('At least 8 characters');
  if (!checks.hasUpperCase) requirements.push('One uppercase letter');
  if (!checks.hasLowerCase) requirements.push('One lowercase letter');
  if (!checks.hasNumber) requirements.push('One number');
  if (!checks.hasSpecialChar) requirements.push('One special character');

  return { strength, score, checks, requirements };
}

export function isPasswordStrong(password: string): boolean {
  const result = checkPasswordStrength(password);
  return result.score >= 4;
}
