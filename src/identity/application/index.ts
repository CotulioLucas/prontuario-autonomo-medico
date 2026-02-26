/**
 * identity/application — casos de uso e ports de servicos externos.
 */

export { LoginUseCase, type LoginInput, type LoginOutput } from './use-cases/login.use-case.js';
export {
  RegisterAutonomousUseCase,
  type RegisterAutonomousInput,
  type RegisterAutonomousOutput,
} from './use-cases/register-autonomous.use-case.js';
export {
  RegisterClinicUseCase,
  type RegisterClinicInput,
  type RegisterClinicOutput,
} from './use-cases/register-clinic.use-case.js';
export {
  ConfirmEmailUseCase,
  type ConfirmEmailInput,
  type ConfirmEmailOutput,
} from './use-cases/confirm-email.use-case.js';
export {
  ResendConfirmationUseCase,
  type ResendConfirmationInput,
  type ResendConfirmationOutput,
} from './use-cases/resend-confirmation.use-case.js';
export {
  ForgotPasswordUseCase,
  type ForgotPasswordInput,
  type ForgotPasswordOutput,
} from './use-cases/forgot-password.use-case.js';
export {
  ResetPasswordUseCase,
  type ResetPasswordInput,
  type ResetPasswordOutput,
} from './use-cases/reset-password.use-case.js';
export {
  AcceptInviteUseCase,
  type AcceptInviteInput,
  type AcceptInviteOutput,
} from './use-cases/accept-invite.use-case.js';
export {
  CreateInviteUseCase,
  ListMembersUseCase,
  ResendInviteUseCase,
  RevokeInviteUseCase,
  UpdateMemberRoleUseCase,
  DeactivateMemberUseCase,
  ListProfessionalsUseCase,
  type CreateInviteInput,
  type ListMembersInput,
  type ListMembersOutput,
  type ResendInviteInput,
  type RevokeInviteInput,
  type UpdateMemberRoleInput,
  type DeactivateMemberInput,
  type ListProfessionalsInput,
  type ListProfessionalsOutput,
} from './use-cases/team.use-cases.js';

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface SessionTokenGenerator {
  generate(userId: string, tenantId: string): string;
}

export interface EmailService {
  sendConfirmationEmail(email: string, token: string, userName: string): Promise<void>;
  sendPasswordResetEmail(email: string, token: string, userName: string): Promise<void>;
  sendInviteEmail(email: string, token: string, inviterName: string, tenantName: string): Promise<void>;
}
