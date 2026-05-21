export const PASSWORD_MIN_LENGTH = 3;
export const PASSWORD_MAX_LENGTH = 20;

export const NAME_MAX_LENGTH = 20;

export const EMAIL_MIN_LENGTH = 5;
export const EMAIL_MAX_LENGTH = 40;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isPasswordLengthValid(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH && password.length <= PASSWORD_MAX_LENGTH;
}

export function isNameLengthValid(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= NAME_MAX_LENGTH;
}

export function isEmailValid(email: string): boolean {
  const trimmed = email.trim();
  return (
    trimmed.length >= EMAIL_MIN_LENGTH &&
    trimmed.length <= EMAIL_MAX_LENGTH &&
    EMAIL_PATTERN.test(trimmed)
  );
}
