import { describe, it, expect } from "vitest";
import {
  transformAutonomousForm,
  AutonomousFormData,
} from "./registration";

describe("Registration Mappers", () => {
  describe("transformAutonomousForm", () => {
    const baseFormData: AutonomousFormData = {
      nome: "João Silva",
      email: "joao@example.com",
      telefone: "+55 11 98765-4321",
      senha: "SecurePassword123",
      confirmaSenha: "SecurePassword123",
      tipoProfissional: "Psicólogo",
      conselho: "crp",
      numeroRegistro: "123456",
      ufRegistro: "SP",
      endereco: {
        rua: "Rua das Flores",
        numero: "123",
        complemento: "Apto 101",
        bairro: "Centro",
        cidade: "São Paulo",
        uf: "SP",
        cep: "01234-567",
      },
      aceitouTermoLGPD: true,
    };

    it("should transform basic fields correctly", () => {
      const payload = transformAutonomousForm(baseFormData);

      expect(payload.name).toBe("João Silva");
      expect(payload.email).toBe("joao@example.com");
      expect(payload.phone).toBe("+55 11 98765-4321");
      expect(payload.password).toBe("SecurePassword123");
    });

    it("should convert conselho to uppercase", () => {
      const payload = transformAutonomousForm(baseFormData);

      expect(payload.professionalInfo.registerType).toBe("CRP");
    });

    it("should convert boolean LGPD to string '1.0'", () => {
      const payload = transformAutonomousForm(baseFormData);

      expect(payload.lgpdConsentVersion).toBe("1.0");
      expect(typeof payload.lgpdConsentVersion).toBe("string");
    });

    it("should nest professional info correctly", () => {
      const payload = transformAutonomousForm(baseFormData);

      expect(payload.professionalInfo).toEqual({
        specialty: "Psicólogo",
        registerType: "CRP",
        registerNumber: "123456",
        registerUf: "SP",
      });
    });

    it("should include complement when provided", () => {
      const payload = transformAutonomousForm(baseFormData);

      expect(payload.address.complement).toBe("Apto 101");
    });

    it("should omit complement when empty", () => {
      const formDataNoComplement: AutonomousFormData = {
        ...baseFormData,
        endereco: {
          ...baseFormData.endereco,
          complemento: "",
        },
      };

      const payload = transformAutonomousForm(formDataNoComplement);

      expect(payload.address.complement).toBeUndefined();
    });

    it("should omit complement when whitespace only", () => {
      const formDataWhitespaceComplement: AutonomousFormData = {
        ...baseFormData,
        endereco: {
          ...baseFormData.endereco,
          complemento: "   ",
        },
      };

      const payload = transformAutonomousForm(formDataWhitespaceComplement);

      expect(payload.address.complement).toBeUndefined();
    });

    it("should include all required address fields", () => {
      const payload = transformAutonomousForm(baseFormData);

      expect(payload.address).toEqual({
        street: "Rua das Flores",
        number: "123",
        neighborhood: "Centro",
        city: "São Paulo",
        state: "SP",
        zipCode: "01234-567",
        complement: "Apto 101",
      });
    });

    it("should always include registerUf", () => {
      const payload = transformAutonomousForm(baseFormData);

      expect(payload.professionalInfo.registerUf).toBe("SP");
      expect(payload.professionalInfo.registerUf).toBeDefined();
    });

    it("should handle uppercase conselho", () => {
      const formDataUppercase: AutonomousFormData = {
        ...baseFormData,
        conselho: "CRM",
      };

      const payload = transformAutonomousForm(formDataUppercase);

      expect(payload.professionalInfo.registerType).toBe("CRM");
    });

    it("should handle mixed-case conselho", () => {
      const formDataMixedCase: AutonomousFormData = {
        ...baseFormData,
        conselho: "CreFiTo",
      };

      const payload = transformAutonomousForm(formDataMixedCase);

      expect(payload.professionalInfo.registerType).toBe("CREFITO");
    });
  });
});
