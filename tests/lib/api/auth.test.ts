import { describe, it, expect, beforeEach, vi } from "vitest";
import { registerAutonomous, registerClinic } from "../../../src/lib/api/auth.js";
import type { AutonomousFormData, ClinicFormData } from "../../../src/lib/mappers/registration.js";

// Mock fetch globally
global.fetch = vi.fn();

describe("Auth API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerAutonomous", () => {
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

    it("should send POST request to correct endpoint", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "user-123" }), { status: 201 })
      );

      await registerAutonomous(baseFormData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/auth/register/autonomo"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
      );
    });

    it("should transform form data using mapper", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "user-123" }), { status: 201 })
      );

      await registerAutonomous(baseFormData);

      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      // Verify mapper transformations
      expect(body.name).toBe("João Silva"); // nome -> name
      expect(body.phone).toBe("+55 11 98765-4321"); // telefone -> phone
      expect(body.professionalInfo.specialty).toBe("Psicólogo"); // tipoProfissional
      expect(body.professionalInfo.registerType).toBe("CRP"); // conselho (uppercase)
      expect(body.address.street).toBe("Rua das Flores"); // endereco.rua -> address.street
      expect(body.lgpdConsentVersion).toBe("1.0"); // boolean -> "1.0"
    });

    it("should return success on 201 response", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "user-123" }), { status: 201 })
      );

      const result = await registerAutonomous(baseFormData);

      expect(result.success).toBe(true);
      expect(result.userId).toBe("user-123");
    });

    it("should map DUPLICATE_EMAIL error", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(
          JSON.stringify({ code: "DUPLICATE_EMAIL", message: "Email already exists" }),
          { status: 409 }
        )
      );

      const result = await registerAutonomous(baseFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Este e-mail já está cadastrado");
    });

    it("should map DUPLICATE_CPF error", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(
          JSON.stringify({ code: "DUPLICATE_CPF", message: "CPF already exists" }),
          { status: 409 }
        )
      );

      const result = await registerAutonomous(baseFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Este CPF já está cadastrado");
    });

    it("should map VALIDATION_ERROR with custom message", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            code: "VALIDATION_ERROR",
            message: "Address is incomplete",
          }),
          { status: 400 }
        )
      );

      const result = await registerAutonomous(baseFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Address is incomplete");
    });

    it("should handle network errors gracefully", async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(
        new Error("Network error")
      );

      const result = await registerAutonomous(baseFormData);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Erro de conexão");
    });
  });

  describe("registerClinic", () => {
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
        cpf: "12345678901",
        telefone: "11987654321",
        senha: "SecurePassword123",
      },
      personalizacao: {
        logoUrl: "https://example.com/logo.png",
        corPrimaria: "#FF0000",
        corSecundaria: "#00FF00",
      },
      aceitouTermoLGPD: true,
    };

    it("should send POST request to correct endpoint", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "clinic-456" }), { status: 201 })
      );

      await registerClinic(baseFormData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/v1/auth/register/clinica"),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
      );
    });

    it("should transform form data using mapper", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "clinic-456" }), { status: 201 })
      );

      await registerClinic(baseFormData);

      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      // Verify mapper transformations
      expect(body.companyName).toBe("Clínica São Paulo LTDA"); // razaoSocial
      expect(body.adminName).toBe("Maria Silva"); // admin.nome (de-nested)
      expect(body.adminEmail).toBe("maria@example.com"); // admin.email (de-nested)
      expect(body.adminPassword).toBe("SecurePassword123"); // admin.senha (de-nested)
      expect(body.address.street).toBe("Avenida Paulista"); // endereco.rua
      expect(body.customization.logoUrl).toBe("https://example.com/logo.png");
      expect(body.customization.primaryColor).toBe("#FF0000"); // corPrimaria
      expect(body.customization.secondaryColor).toBe("#00FF00"); // corSecundaria
      expect(body.lgpdConsentVersion).toBe("1.0");
    });

    it("should NOT send admin.cpf in payload", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "clinic-456" }), { status: 201 })
      );

      await registerClinic(baseFormData);

      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      expect(body).not.toHaveProperty("cpf");
      expect(body).not.toHaveProperty("adminCpf");
    });

    it("should NOT send admin.telefone in payload", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "clinic-456" }), { status: 201 })
      );

      await registerClinic(baseFormData);

      const callArgs = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      expect(body).not.toHaveProperty("telefone");
      expect(body).not.toHaveProperty("adminTelefone");
    });

    it("should return success on 201 response", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "clinic-456" }), { status: 201 })
      );

      const result = await registerClinic(baseFormData);

      expect(result.success).toBe(true);
      expect(result.userId).toBe("clinic-456");
    });

    it("should map DUPLICATE_CNPJ error", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(
          JSON.stringify({ code: "DUPLICATE_CNPJ", message: "CNPJ already exists" }),
          { status: 409 }
        )
      );

      const result = await registerClinic(baseFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Este CNPJ já está cadastrado");
    });

    it("should map DUPLICATE_EMAIL error", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce(
        new Response(
          JSON.stringify({ code: "DUPLICATE_EMAIL", message: "Email already exists" }),
          { status: 409 }
        )
      );

      const result = await registerClinic(baseFormData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Este e-mail já está cadastrado");
    });

    it("should handle network errors gracefully", async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(
        new Error("Network error")
      );

      const result = await registerClinic(baseFormData);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Erro de conexão");
    });
  });
});
