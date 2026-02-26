/**
 * Authentication API Client
 *
 * Handles authentication-related API calls including registration.
 *
 * @module lib/api/auth
 */

import {
  transformAutonomousForm,
  transformClinicForm,
  AutonomousFormData,
  ClinicFormData,
} from "@/lib/mappers/registration";

export interface RegistrationResponse {
  success: boolean;
  message?: string;
  userId?: string;
}

interface BackendErrorResponse {
  code?: string;
  message?: string;
}

function mapErrorMessage(error: BackendErrorResponse): string {
  switch (error.code) {
    case "DUPLICATE_EMAIL":
      return "Este e-mail já está cadastrado";
    case "DUPLICATE_CPF":
      return "Este CPF já está cadastrado";
    case "DUPLICATE_CNPJ":
      return "Este CNPJ já está cadastrado";
    case "VALIDATION_ERROR":
      return error.message || "Dados inválidos.";
    default:
      return error.message || "Erro ao processar cadastro.";
  }
}

export async function registerAutonomous(
  formData: AutonomousFormData
): Promise<RegistrationResponse> {
  try {
    const payload = transformAutonomousForm(formData);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const response = await fetch(`${apiUrl}/api/v1/auth/register/autonomo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, userId: data.id };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      message: mapErrorMessage(errorData),
    };
  } catch (error) {
    console.error("[registerAutonomous]", error);
    return {
      success: false,
      message: "Erro de conexão.",
    };
  }
}

export async function registerClinic(
  formData: ClinicFormData
): Promise<RegistrationResponse> {
  try {
    const payload = transformClinicForm(formData);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const response = await fetch(`${apiUrl}/api/v1/auth/register/clinica`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, userId: data.id };
    }

    const errorData = await response.json().catch(() => ({}));
    return {
      success: false,
      message: mapErrorMessage(errorData),
    };
  } catch (error) {
    console.error("[registerClinic]", error);
    return {
      success: false,
      message: "Erro de conexão.",
    };
  }
}
