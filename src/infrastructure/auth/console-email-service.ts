import type { EmailService } from '../../identity/application/index.js'

export class ConsoleEmailService implements EmailService {
  async sendConfirmationEmail(email: string, token: string, userName: string): Promise<void> {
    console.log(`[Email] Confirmation email to ${email} (${userName})`)
    console.log(`[Email] Token: ${token}`)
    console.log(`[Email] Confirmation URL: http://localhost:3001/confirmar-email?token=${token}`)
  }

  async sendPasswordResetEmail(email: string, token: string, userName: string): Promise<void> {
    console.log(`[Email] Password reset email to ${email} (${userName})`)
    console.log(`[Email] Token: ${token}`)
    console.log(`[Email] Reset URL: http://localhost:3001/redefinir-senha?token=${token}`)
  }

  async sendInviteEmail(email: string, token: string, inviterName: string, tenantName: string): Promise<void> {
    console.log(`[Email] Invite email to ${email}`)
    console.log(`[Email] Inviter: ${inviterName}`)
    console.log(`[Email] Tenant: ${tenantName}`)
    console.log(`[Email] Token: ${token}`)
    console.log(`[Email] Invite URL: http://localhost:3001/convite?token=${token}`)
  }
}
