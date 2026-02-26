/**
 * Setup centralizado para registro de handlers de eventos.
 * Este arquivo conecta os handlers de cada modulo ao EventBus.
 * @see ADR 0004, US-ARQ-06
 */

import { subscribeToEvent } from './index.js';
import {
  APPOINTMENT_COMPLETED_EVENT,
  type AppointmentCompletedEvent,
} from '../../scheduling/domain/index.js';
import {
  createAttendanceHandler,
  type CreateAttendanceUseCase,
} from '../../clinical/application/index.js';
import {
  createReceivableHandler,
  type CreateReceivableUseCase,
  type TariffResolverPort,
} from '../../billing/application/index.js';

export interface EventHandlersConfig {
  clinical: {
    createAttendanceUseCase: CreateAttendanceUseCase;
  };
  billing: {
    createReceivableUseCase: CreateReceivableUseCase;
    tariffResolver: TariffResolverPort;
  };
}

export function setupEventHandlers(config: EventHandlersConfig): void {
  subscribeToEvent(
    APPOINTMENT_COMPLETED_EVENT,
    createAttendanceHandler(config.clinical.createAttendanceUseCase),
    'clinical'
  );

  subscribeToEvent(
    APPOINTMENT_COMPLETED_EVENT,
    createReceivableHandler(
      config.billing.createReceivableUseCase,
      config.billing.tariffResolver
    ),
    'billing'
  );
}
