/**
 * Politique de mot de passe commune (création de compte, changement, réinitialisation).
 * 8 caractères minimum, au moins une majuscule, une minuscule, un chiffre et un
 * caractère spécial.
 */
export const PASSWORD_RULES_HINT =
  '8 caractères minimum, avec majuscule, minuscule, chiffre et caractère spécial.';

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères.';
  if (!/[A-Z]/.test(password)) return 'Le mot de passe doit contenir au moins une majuscule.';
  if (!/[a-z]/.test(password)) return 'Le mot de passe doit contenir au moins une minuscule.';
  if (!/[0-9]/.test(password)) return 'Le mot de passe doit contenir au moins un chiffre.';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Le mot de passe doit contenir au moins un caractère spécial.';
  return null;
}
