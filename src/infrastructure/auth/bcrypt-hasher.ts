import type { PasswordHasher } from '../../identity/application/index.js'
import bcrypt from 'bcrypt'

export class BcryptPasswordHasher implements PasswordHasher {
  private readonly saltRounds = 12

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds)
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
}
