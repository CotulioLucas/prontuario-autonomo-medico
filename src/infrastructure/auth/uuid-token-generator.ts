import type { SessionTokenGenerator } from '../../identity/application/index.js'
import { randomUUID } from 'crypto'

export class UuidSessionTokenGenerator implements SessionTokenGenerator {
  generate(userId: string, tenantId: string): string {
    return randomUUID()
  }
}
