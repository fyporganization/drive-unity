// [^\s@] can never match '@', so the pattern has no ambiguity and runs in
// linear time (no catastrophic backtracking).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}
