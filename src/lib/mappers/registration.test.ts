import { describe, it, expect } from "vitest";
import {
  transformAutonomousForm,
  transformClinicForm,
  AutonomousFormData,
  ClinicFormData,
} from "./registration.js";

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

  describe("transformClinicForm", () => {
    const baseFormData: ClinicFormData = {
      razaoSocial: "Clínica São Paulo LTDA",
      cnpj: "12.345.678/0001-90",
      endereco: {
        rua: "Avenida Paulista",
        numero: "1000",
        complemento: "Sala 500",
        bairro: "Bela Vista",
        cidade: "São Paulo",
        uf: "SP",
        cep: "01311-100",
      },
      admin: {
        nome: "Maria Silva",
        email: "maria@example.com",
        cpf: "12345678901", // collected but not sent
        telefone: "11987654321", // collected but not sent
        senha: "SecurePassword123",
      },
      personalizacao: {
        logoUrl: "https://example.com/logo.png",
        corPrimaria: "#FF0000",
        corSecundaria: "#00FF00",
      },
      aceitouTermoLGPD: true,
    };

    it("should de-nest admin fields correctly", () => {
      const payload = transformClinicForm(baseFormData);

      expect(payload.adminName).toBe("Maria Silva");
      expect(payload.adminEmail).toBe("maria@example.com");
      expect(payload.adminPassword).toBe("SecurePassword123");
    });

    it("should not include admin.cpf in payload", () => {
      const payload = transformClinicForm(baseFormData);

      expect(payload).not.toHaveProperty("adminCpf");
      expect(payload).not.toHaveProperty("cpf");
    });

    it("should not include admin.telefone in payload", () => {
      const payload = transformClinicForm(baseFormData);

      expect(payload).not.toHaveProperty("adminTelefone");
      expect(payload).not.toHaveProperty("telefone");
    });

    it("should convert boolean LGPD to string '1.0'", () => {
      const payload = transformClinicForm(baseFormData);

      expect(payload.lgpdConsentVersion).toBe("1.0");
      expect(typeof payload.lgpdConsentVersion).toBe("string");
    });

    it("should include customization when all fields are provided", () => {
      const payload = transformClinicForm(baseFormData);

      expect(payload.customization).toEqual({
        logoUrl: "https://example.com/logo.png",
        primaryColor: "#FF0000",
        secondaryColor: "#00FF00",
      });
    });

    it("should rename customization fields correctly", () => {
      const payload = transformClinicForm(baseFormData);

      // Portuguese -> English
      expect(payload.customization?.primaryColor).toBe("#FF0000");
      expect(payload.customization?.secondaryColor).toBe("#00FF00");
    });

    it("should omit customization if not provided", () => {
      const formDataNoCustomization: ClinicFormData = {
        ...baseFormData,
        personalizacao: undefined,
      };

      const payload = transformClinicForm(formDataNoCustomization);

      expect(payload.customization).toBeUndefined();
    });

    it("should omit customization if all fields are empty", () => {
      const formDataEmptyCustomization: ClinicFormData = {
        ...baseFormData,
        personalizacao: {
          logoUrl: undefined,
          corPrimaria: undefined,
          corSecundaria: undefined,
        },
      };

      const payload = transformClinicForm(formDataEmptyCustomization);

      expect(payload.customization).toBeUndefined();
    });

    it("should include customization with only logoUrl", () => {
      const formDataPartialCustomization: ClinicFormData = {
        ...baseFormData,
        personalizacao: {
          logoUrl: "https://example.com/logo.png",
        },
      };

      const payload = transformClinicForm(formDataPartialCustomization);

      expect(payload.customization).toEqual({
        logoUrl: "https://example.com/logo.png",
      });
    });

    it("should include all required company and address fields", () => {
      const payload = transformClinicForm(baseFormData);

      expect(payload.companyName).toBe("Clínica São Paulo LTDA");
      expect(payload.cnpj).toBe("12.345.678/0001-90");
      expect(payload.address).toEqual({
        street: "Avenida Paulista",
        number: "1000",
        neighborhood: "Bela Vista",
        city: "São Paulo",
        state: "SP",
        zipCode: "01311-100",
        complement: "Sala 500",
      });
    });

    it("should omit address.complement when empty", () => {
      const formDataNoComplement: ClinicFormData = {
        ...baseFormData,
        endereco: {
          ...baseFormData.endereco,
          complemento: "",
        },
      };

      const payload = transformClinicForm(formDataNoComplement);

      expect(payload.address.complement).toBeUndefined();
    });

    it("should omit address.complement when whitespace only", () => {
      const formDataWhitespaceComplement: ClinicFormData = {
        ...baseFormData,
        endereco: {
          ...baseFormData.endereco,
          complemento: "   ",
        },
      };

      const payload = transformClinicForm(formDataWhitespaceComplement);

      expect(payload.address.complement).toBeUndefined();
    });
  });
});
