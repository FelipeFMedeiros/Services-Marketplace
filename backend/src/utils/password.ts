import bcrypt from 'bcryptjs';

/**
 * Faz hash de uma senha usando bcrypt
 * @param password - Senha em texto plano
 * @returns Hash da senha
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compara uma senha em texto plano com um hash
 * @param password - Senha em texto plano
 * @param hash - Hash armazenado no banco
 * @returns true se as senhas coincidirem
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
