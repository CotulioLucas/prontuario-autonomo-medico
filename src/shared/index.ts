/**
 * shared — tipos comuns, eventos base, erros, tenantId.
 * Domínio de um módulo não importa domain de outro; pode importar shared.
 * @see ADR 0007
 */

export * from './types.js';
export * from './events.js';
export * from './errors.js';
export * from './tenantId.js';
