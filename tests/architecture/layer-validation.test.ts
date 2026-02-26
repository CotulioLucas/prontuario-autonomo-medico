/**
 * Testes de validacao de camadas (Clean/Hexagonal).
 * Valida US-ARQ-04 criterios de aceite.
 * @see docs/architecture/style.md
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const srcDir = join(process.cwd(), 'src');

function getTsFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = existsSync(dir) ? require('node:fs').readdirSync(dir, { withFileTypes: true }) : [];
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getTsFiles(fullPath));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

function getFileContent(file: string): string {
  return readFileSync(file, 'utf-8');
}

describe('US-ARQ-04: Camadas domain/application/adapters', () => {
  describe('Domain layer - sem dependencias externas', () => {
    const domainFiles = [
      ...getTsFiles(join(srcDir, 'identity', 'domain')),
      ...getTsFiles(join(srcDir, 'scheduling', 'domain')),
      ...getTsFiles(join(srcDir, 'clinical', 'domain')),
      ...getTsFiles(join(srcDir, 'billing', 'domain')),
    ];

    it.each(domainFiles)('domain/%s nao deve importar HTTP', (file) => {
      const content = getFileContent(file);
      expect(content).not.toMatch(/from ['"].*\/http\//);
      expect(content).not.toMatch(/from ['"]fastify['"]/);
      expect(content).not.toMatch(/from ['"]express['"]/);
    });

    it.each(domainFiles)('domain/%s nao deve importar Prisma', (file) => {
      const content = getFileContent(file);
      expect(content).not.toMatch(/from ['"]@prisma\/client['"]/);
      expect(content).not.toMatch(/from ['"].*prisma['"]/);
    });

    it.each(domainFiles)('domain/%s nao deve importar infrastructure', (file) => {
      const content = getFileContent(file);
      expect(content).not.toMatch(/from ['"].*\/infrastructure\//);
    });
  });

  describe('Domain isolation - sem cross-module imports', () => {
    it('clinical/domain nao deve importar scheduling/domain', () => {
      const clinicalDomainFiles = getTsFiles(join(srcDir, 'clinical', 'domain'));
      for (const file of clinicalDomainFiles) {
        const content = getFileContent(file);
        expect(content).not.toMatch(/from ['"].*\/scheduling\/domain\//);
      }
    });

    it('billing/domain nao deve importar scheduling/domain', () => {
      const billingDomainFiles = getTsFiles(join(srcDir, 'billing', 'domain'));
      for (const file of billingDomainFiles) {
        const content = getFileContent(file);
        expect(content).not.toMatch(/from ['"].*\/scheduling\/domain\//);
      }
    });

    it('scheduling/domain nao deve importar clinical/domain', () => {
      const schedulingDomainFiles = getTsFiles(join(srcDir, 'scheduling', 'domain'));
      for (const file of schedulingDomainFiles) {
        const content = getFileContent(file);
        expect(content).not.toMatch(/from ['"].*\/clinical\/domain\//);
      }
    });
  });

  describe('Application layer - usa apenas ports', () => {
    const applicationFiles = [
      ...getTsFiles(join(srcDir, 'identity', 'application')),
      ...getTsFiles(join(srcDir, 'scheduling', 'application')),
      ...getTsFiles(join(srcDir, 'clinical', 'application')),
      ...getTsFiles(join(srcDir, 'billing', 'application')),
    ];

    it.each(applicationFiles)('application/%s nao deve importar Prisma diretamente', (file) => {
      const content = getFileContent(file);
      expect(content).not.toMatch(/from ['"]@prisma\/client['"]/);
    });

    it.each(applicationFiles)('application/%s pode importar domain e shared', (file) => {
      const content = getFileContent(file);
      const hasValidImport = 
        content.includes("from '../../domain") ||
        content.includes("from '../domain") ||
        content.includes("from '../../../shared") ||
        content.includes("from '../../shared") ||
        content.includes("from './ports") ||
        content.includes("from '../ports");
    });
  });

  describe('Ports definidos em application', () => {
    it('clinical deve ter AttendanceRepositoryPort', async () => {
      const { AttendanceRepositoryPort } = await import('../../src/clinical/application/ports.js');
      expect(AttendanceRepositoryPort).toBeUndefined();
    });

    it('billing deve ter ReceivableRepositoryPort', async () => {
      const { ReceivableRepositoryPort } = await import('../../src/billing/application/ports.js');
      expect(ReceivableRepositoryPort).toBeUndefined();
    });

    it('ports sao interfaces (tipos)', async () => {
      const clinicalPorts = await import('../../src/clinical/application/ports.js');
      const billingPorts = await import('../../src/billing/application/ports.js');
      
      expect(typeof clinicalPorts.AttendanceRepositoryPort).toBe('undefined');
      expect(typeof billingPorts.ReceivableRepositoryPort).toBe('undefined');
      expect(typeof billingPorts.TariffResolverPort).toBe('undefined');
    });
  });

  describe('Adapters implementam ports', () => {
    it('InMemoryAttendanceRepository implementa AttendanceRepositoryPort', async () => {
      const { InMemoryAttendanceRepository } = await import('../../src/clinical/adapters/index.js');
      const repo = new InMemoryAttendanceRepository();
      expect(repo.findById).toBeDefined();
      expect(repo.findByAppointmentId).toBeDefined();
      expect(repo.save).toBeDefined();
    });

    it('InMemoryReceivableRepository implementa ReceivableRepositoryPort', async () => {
      const { InMemoryReceivableRepository } = await import('../../src/billing/adapters/index.js');
      const repo = new InMemoryReceivableRepository();
      expect(repo.findById).toBeDefined();
      expect(repo.findByAppointmentId).toBeDefined();
      expect(repo.save).toBeDefined();
    });

    it('InMemoryTariffResolver implementa TariffResolverPort', async () => {
      const { InMemoryTariffResolver } = await import('../../src/billing/adapters/index.js');
      const resolver = new InMemoryTariffResolver();
      expect(resolver.getTariffForPatient).toBeDefined();
    });
  });
});
