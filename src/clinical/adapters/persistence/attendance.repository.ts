/**
 * Adapter: Repositório de Atendimentos.
 * Implementa AttendanceRepositoryPort usando in-memory storage.
 * @see US-ARQ-04
 */

import type { Attendance } from '../../domain/index.js';
import type { AttendanceRepositoryPort } from '../../application/ports.js';
import { requireTenantId } from '../../../infrastructure/http/context.js';

export class InMemoryAttendanceRepository implements AttendanceRepositoryPort {
  private storage: Map<string, Attendance> = new Map();

  async findById(id: string): Promise<Attendance | null> {
    const tenantId = requireTenantId();
    const attendance = this.storage.get(id);
    if (!attendance || attendance.tenantId !== tenantId) {
      return null;
    }
    return attendance;
  }

  async findByAppointmentId(appointmentId: string): Promise<Attendance | null> {
    const tenantId = requireTenantId();
    for (const attendance of this.storage.values()) {
      if (attendance.appointmentId === appointmentId && attendance.tenantId === tenantId) {
        return attendance;
      }
    }
    return null;
  }

  async save(attendance: Attendance): Promise<void> {
    const tenantId = requireTenantId();
    if (attendance.tenantId !== tenantId) {
      throw new Error(
        `Tenant mismatch: entity belongs to tenant ${attendance.tenantId}, but context is tenant ${tenantId}`
      );
    }
    this.storage.set(attendance.id, attendance);
  }

  async delete(id: string): Promise<void> {
    const tenantId = requireTenantId();
    const attendance = await this.findById(id);
    if (attendance && attendance.tenantId === tenantId) {
      this.storage.delete(id);
    }
  }
}
