/**
 * Registration Form Data Mappers
 *
 * Transforms frontend form data (Portuguese, flat structure) to backend API contract
 * (English, nested structure).
 *
 * This module implements the Adapter pattern to decouple form UI from API contract.
 *
 * @module lib/mappers/registration
 */

// ============================================================================
// FRONTEND FORM DATA (Input) - Portuguese, flat structure
// ============================================================================

/**
 * Autonomous professional registration form data.
 *
 * This is what the React form collects from the user.
 * Fields are named in Portuguese following UI/UX conventions.
 */
export interface AutonomousFormData {
  // Personal information
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  confirmaSenha: string; // local validation only, not sent to backend

  // Professional information
  tipoProfissional: string;
  conselho: string; // CRM | CRP | CREFITO | OUTRO
  numeroRegistro: string;
  ufRegistro: string; // UF where professional is registered (CRITICAL: required!)

  // Address
  endereco: {
    rua: string;
    numero: string;
    complemento?: string; // optional
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };

  // Terms & conditions
  aceitouTermoLGPD: boolean;
}

/**
 * Clinic registration form data.
 *
 * This is what the React form collects from the user.
 * Fields are named in Portuguese following UI/UX conventions.
 */
export interface ClinicFormData {
  // Company information
  razaoSocial: string;
  cnpj: string;

  // Address
  endereco: {
    rua: string;
    numero: string;
    complemento?: string; // optional
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };

  // Administrator account
  admin: {
    nome: string;
    email: string;
    cpf?: string; // collected but not sent to backend
    telefone?: string; // collected but not sent to backend
    senha: string;
  };

  // Customization (optional)
  personalizacao?: {
    logoUrl?: string;
    corPrimaria?: string; // hex color
    corSecundaria?: string; // hex color
  };

  // Terms & conditions
  aceitouTermoLGPD: boolean;
}

// ============================================================================
// BACKEND API CONTRACT (Output) - English, nested structure
// ============================================================================

/**
 * Autonomous professional registration payload for API.
 *
 * This is the contract expected by POST /api/v1/auth/register/autonomo
 * Fields are named in English with nested structure.
 */
export interface AutonomousRegistrationPayload {
  // Personal information
  name: string;
  email: string;
  phone: string;
  password: string;

  // Professional information
  professionalInfo: {
    specialty: string; // from: tipoProfissional
    registerType: string; // from: conselho (UPPERCASE)
    registerNumber: string; // from: numeroRegistro
    registerUf: string; // from: ufRegistro (REQUIRED!)
  };

  // Address
  address: {
    street: string; // from: endereco.rua
    number: string; // from: endereco.numero
    complement?: string; // from: endereco.complemento (optional)
    neighborhood: string; // from: endereco.bairro
    city: string; // from: endereco.cidade
    state: string; // from: endereco.uf
    zipCode: string; // from: endereco.cep
  };

  // Terms & conditions
  lgpdConsentVersion: "1.0"; // from: aceitouTermoLGPD (boolean -> "1.0")
}

/**
 * Clinic registration payload for API.
 *
 * This is the contract expected by POST /api/v1/auth/register/clinica
 * Fields are named in English with nested structure.
 */
export interface ClinicRegistrationPayload {
  // Company information
  companyName: string; // from: razaoSocial
  cnpj: string;

  // Address
  address: {
    street: string; // from: endereco.rua
    number: string; // from: endereco.numero
    complement?: string; // from: endereco.complemento (optional)
    neighborhood: string; // from: endereco.bairro
    city: string; // from: endereco.cidade
    state: string; // from: endereco.uf
    zipCode: string; // from: endereco.cep
  };

  // Administrator account
  adminName: string; // from: admin.nome (de-nested)
  adminEmail: string; // from: admin.email (de-nested)
  adminPassword: string; // from: admin.senha (de-nested)

  // Customization (optional)
  customization?: {
    logoUrl?: string; // from: personalizacao.logoUrl
    primaryColor?: string; // from: personalizacao.corPrimaria
    secondaryColor?: string; // from: personalizacao.corSecundaria
  };

  // Terms & conditions
  lgpdConsentVersion: "1.0"; // from: aceitouTermoLGPD (boolean -> "1.0")
}

// ============================================================================
// MAPPER FUNCTIONS (to be implemented in T2 and T3)
// ============================================================================

/**
 * Transforms autonomous professional form data to API contract.
 *
 * @param formData - Form data collected from UI
 * @returns Payload ready for POST /api/v1/auth/register/autonomo
 *
 * Transformations:
 * - Renames fields (Portuguese -> English)
 * - Nests professional info and address
 * - Converts boolean LGPD to string "1.0"
 * - Converts conselho to uppercase
 * - Omits optional fields if empty
 */
export function transformAutonomousForm(
  formData: AutonomousFormData
): AutonomousRegistrationPayload {
  // Build address object, omitting complement if empty
  const addressPayload: AutonomousRegistrationPayload["address"] = {
    street: formData.endereco.rua,
    number: formData.endereco.numero,
    neighborhood: formData.endereco.bairro,
    city: formData.endereco.cidade,
    state: formData.endereco.uf,
    zipCode: formData.endereco.cep,
  };

  // Include complement only if it has a value
  if (formData.endereco.complemento && formData.endereco.complemento.trim()) {
    addressPayload.complement = formData.endereco.complemento;
  }

  return {
    name: formData.nome,
    email: formData.email,
    phone: formData.telefone,
    password: formData.senha,
    professionalInfo: {
      specialty: formData.tipoProfissional,
      registerType: formData.conselho.toUpperCase(),
      registerNumber: formData.numeroRegistro,
      registerUf: formData.ufRegistro,
    },
    address: addressPayload,
    lgpdConsentVersion: "1.0",
  };
}

/**
 * Transforms clinic form data to API contract.
 *
 * @param formData - Form data collected from UI
 * @returns Payload ready for POST /api/v1/auth/register/clinica
 *
 * Transformations:
 * - Renames fields (Portuguese -> English)
 * - De-nests admin fields
 * - Omits admin.cpf and admin.telefone (not sent to backend)
 * - Omits customization if not provided
 * - Converts boolean LGPD to string "1.0"
 */
export function transformClinicForm(
  formData: ClinicFormData
): ClinicRegistrationPayload {
  // Build address object, omitting complement if empty
  const addressPayload: ClinicRegistrationPayload["address"] = {
    street: formData.endereco.rua,
    number: formData.endereco.numero,
    neighborhood: formData.endereco.bairro,
    city: formData.endereco.cidade,
    state: formData.endereco.uf,
    zipCode: formData.endereco.cep,
  };

  // Include complement only if it has a value
  if (formData.endereco.complemento && formData.endereco.complemento.trim()) {
    addressPayload.complement = formData.endereco.complemento;
  }

  // Build base payload
  const payload: ClinicRegistrationPayload = {
    companyName: formData.razaoSocial,
    cnpj: formData.cnpj,
    address: addressPayload,
    adminName: formData.admin.nome,
    adminEmail: formData.admin.email,
    adminPassword: formData.admin.senha,
    lgpdConsentVersion: "1.0",
  };

  // Include customization only if provided and has at least one field
  if (formData.personalizacao) {
    const customization: ClinicRegistrationPayload["customization"] = {};
    let hasCustomizationFields = false;

    if (formData.personalizacao.logoUrl) {
      customization.logoUrl = formData.personalizacao.logoUrl;
      hasCustomizationFields = true;
    }

    if (formData.personalizacao.corPrimaria) {
      customization.primaryColor = formData.personalizacao.corPrimaria;
      hasCustomizationFields = true;
    }

    if (formData.personalizacao.corSecundaria) {
      customization.secondaryColor = formData.personalizacao.corSecundaria;
      hasCustomizationFields = true;
    }

    if (hasCustomizationFields) {
      payload.customization = customization;
    }
  }

  return payload;
}
