/**
 * Authentication API Client
 *
 * Handles authentication-related API calls including registration,
 * login, logout, and password recovery.
 *
 * @module lib/api/auth
 */

import {
  transformAutonomousForm,
  transformClinicForm,
  AutonomousFormData,
  ClinicFormData,
} from "../mappers/registration.js";

/**
 * API response for registration endpoints
 */
export interface RegistrationResponse {
  success: boolean;
  message?: string;
  userId?: string;
}

/**
 * Error codes returned by backend registration endpoints
 */
type RegistrationErrorCode =
  | "DUPLICATE_EMAIL"
  | "DUPLICATE_CPF"
  | "DUPLICATE_CNPJ"
  | "VALIDATION_ERROR"
  | "INTERNAL_SERVER_ERROR";

/**
 * Backend error response structure
 */
interface BackendErrorResponse {
  code?: RegistrationErrorCode;
  message?: string;
  errors?: Record<string, string[]>;
}

/**
 * Maps backend error codes to user-friendly messages
 */
function mapErrorMessage(error: BackendErrorResponse): string {
  switch (error.code) {
    case "DUPLICATE_EMAIL":
      return "Este e-mail já está cadastrado";
    case "DUPLICATE_CPF":
      return "Este CPF já está cadastrado";
    case "DUPLICATE_CNPJ":
      return "Este CNPJ já está cadastrado";
    case "VALIDATION_ERROR":
      return error.message || "Dados inválidos. Verifique os campos.";
    default:
      return (
        error.message || "Erro ao processar seu cadastro. Tente novamente."
      );
  }
}

/**
 * Register autonomous professional
 *
 * @param formData - Autonomous professional form data (Portuguese naming)
 * @returns Success status and optional error message
 *
 * Flow:
 * 1. Transform form data using mapper (Portuguese -> English)
 * 2. POST to /api/v1/auth/register/autonomo
 * 3. Handle response and map errors to user-friendly messages
 */
export async function registerAutonomous(
  formData: AutonomousFormData
): Promise<RegistrationResponse> {
  try {
    // Transform frontend form data to backend contract
    const payload = transformAutonomousForm(formData);

    // Determine API base URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    // Make API call
    const response = await fetch(
      `${apiUrl}/api/v1/auth/register/autonomo`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include", // Include cookies for session
      }
    );

    // Success response (201 Created)
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        userId: data.id,
      };
    }

    // Error response (400, 409, 500, etc)
    const errorData: BackendErrorResponse = await response.json().catch(
      () => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      })
    );

    return {
      success: false,
      message: mapErrorMessage(errorData),
    };
  } catch (error) {
    // Network or other errors
    console.error("[registerAutonomous] Error:", error);

    return {
      success: false,
      message: "Erro de conexão. Verifique sua internet e tente novamente.",
    };
  }
}

/**
 * Register clinic
 *
 * @param formData - Clinic form data (Portuguese naming)
 * @returns Success status and optional error message
 *
 * Flow:
 * 1. Transform form data using mapper (Portuguese -> English)
 * 2. POST to /api/v1/auth/register/clinica
 * 3. Handle response and map errors to user-friendly messages
 */
export async function registerClinic(
  formData: ClinicFormData
): Promise<RegistrationResponse> {
  try {
    // Transform frontend form data to backend contract
    const payload = transformClinicForm(formData);

    // Determine API base URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    // Make API call
    const response = await fetch(
      `${apiUrl}/api/v1/auth/register/clinica`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include", // Include cookies for session
      }
    );

    // Success response (201 Created)
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        userId: data.id,
      };
    }

    // Error response (400, 409, 500, etc)
    const errorData: BackendErrorResponse = await response.json().catch(
      () => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      })
    );

    return {
      success: false,
      message: mapErrorMessage(errorData),
    };
  } catch (error) {
    // Network or other errors
    console.error("[registerClinic] Error:", error);

    return {
      success: false,
      message: "Erro de conexão. Verifique sua internet e tente novamente.",
    };
  }
}
