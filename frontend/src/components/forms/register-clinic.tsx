"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { registerClinic } from "@/lib/api/auth";
import type { ClinicFormData } from "@/lib/mappers/registration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Clinic Registration Form Validation Schema
 *
 * Validates form data before submission. All validations are for user experience
 * and error handling. Backend performs final validation.
 */
const clinicSchema = z
  .object({
    razaoSocial: z
      .string()
      .min(3, "Razão social deve ter pelo menos 3 caracteres")
      .max(150, "Razão social não pode ter mais de 150 caracteres"),
    cnpj: z
      .string()
      .regex(
        /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
        "CNPJ inválido (formato: XX.XXX.XXX/XXXX-XX)"
      ),
    endereco: z.object({
      rua: z
        .string()
        .min(1, "Rua obrigatória")
        .max(100, "Rua muito longa"),
      numero: z
        .string()
        .min(1, "Número obrigatório")
        .max(10, "Número inválido"),
      complemento: z.string().max(50, "Complemento muito longo").optional(),
      bairro: z
        .string()
        .min(1, "Bairro obrigatório")
        .max(50, "Bairro muito longo"),
      cidade: z
        .string()
        .min(1, "Cidade obrigatória")
        .max(50, "Cidade muito longa"),
      uf: z
        .string()
        .length(2, "UF deve ter 2 caracteres")
        .toUpperCase(),
      cep: z
        .string()
        .regex(/^\d{5}-?\d{3}$/, "CEP inválido (formato: XXXXX-XXX)"),
    }),
    admin: z.object({
      nome: z
        .string()
        .min(3, "Nome do admin deve ter pelo menos 3 caracteres")
        .max(100, "Nome muito longo"),
      email: z
        .string()
        .email("E-mail inválido")
        .max(100, "E-mail não pode ter mais de 100 caracteres"),
      cpf: z.string().optional(), // collected but not sent to backend
      telefone: z.string().optional(), // collected but not sent to backend
      senha: z
        .string()
        .min(8, "Senha deve ter pelo menos 8 caracteres")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          "Senha deve conter letras maiúsculas, minúsculas e números"
        ),
    }),
    confirmaSenha: z.string(),
    personalizacao: z
      .object({
        logoUrl: z
          .string()
          .url("URL de logo inválida")
          .optional()
          .or(z.literal("")),
        corPrimaria: z
          .string()
          .regex(/^#[0-9A-F]{6}$/i, "Cor primária inválida (formato: #XXXXXX)")
          .optional()
          .or(z.literal("")),
        corSecundaria: z
          .string()
          .regex(
            /^#[0-9A-F]{6}$/i,
            "Cor secundária inválida (formato: #XXXXXX)"
          )
          .optional()
          .or(z.literal("")),
      })
      .optional(),
    aceitouTermoLGPD: z
      .boolean()
      .refine(
        (val) => val === true,
        "Você deve aceitar os termos de LGPD"
      ),
  })
  .refine((data) => data.admin.senha === data.confirmaSenha, {
    message: "Senhas não conferem",
    path: ["confirmaSenha"],
  });

type FormData = z.infer<typeof clinicSchema>;

/**
 * Clinic Registration Form Component
 *
 * Handles registration of clinics with form validation,
 * API submission, and error handling.
 */
export function RegisterClinicForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      aceitouTermoLGPD: false,
    },
  });

  const aceitouTermoLGPD = watch("aceitouTermoLGPD");
  const adminSenha = watch("admin.senha");
  const confirmaSenha = watch("confirmaSenha");

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      // Transform frontend data to match ClinicFormData interface
      const formData: ClinicFormData = {
        razaoSocial: data.razaoSocial,
        cnpj: data.cnpj,
        endereco: {
          rua: data.endereco.rua,
          numero: data.endereco.numero,
          complemento: data.endereco.complemento || undefined,
          bairro: data.endereco.bairro,
          cidade: data.endereco.cidade,
          uf: data.endereco.uf,
          cep: data.endereco.cep.replace("-", ""),
        },
        admin: {
          nome: data.admin.nome,
          email: data.admin.email,
          cpf: data.admin.cpf,
          telefone: data.admin.telefone,
          senha: data.admin.senha,
        },
        personalizacao: {
          logoUrl: data.personalizacao?.logoUrl || undefined,
          corPrimaria: data.personalizacao?.corPrimaria || undefined,
          corSecundaria: data.personalizacao?.corSecundaria || undefined,
        },
        aceitouTermoLGPD: true,
      };

      const result = await registerClinic(formData);

      if (result.success) {
        toast.success("Cadastro realizado! Verifique seu e-mail.");
        router.push("/auth/email-confirmation");
      } else {
        toast.error(result.message || "Erro ao registrar");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {/* Company Information Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Informações da Clínica</legend>

        <div>
          <Label htmlFor="razaoSocial">Razão Social *</Label>
          <Input
            id="razaoSocial"
            {...register("razaoSocial")}
            placeholder="Clínica São Paulo LTDA"
            disabled={isLoading}
          />
          {errors.razaoSocial && (
            <span className="text-sm text-red-500">
              {errors.razaoSocial.message}
            </span>
          )}
        </div>

        <div>
          <Label htmlFor="cnpj">CNPJ *</Label>
          <Input
            id="cnpj"
            {...register("cnpj")}
            placeholder="12.345.678/0001-90"
            disabled={isLoading}
          />
          {errors.cnpj && (
            <span className="text-sm text-red-500">{errors.cnpj.message}</span>
          )}
        </div>
      </fieldset>

      {/* Address Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Endereço</legend>

        <div>
          <Label htmlFor="endereco.rua">Rua *</Label>
          <Input
            id="endereco.rua"
            {...register("endereco.rua")}
            placeholder="Avenida Paulista"
            disabled={isLoading}
          />
          {errors.endereco?.rua && (
            <span className="text-sm text-red-500">
              {errors.endereco.rua.message}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="endereco.numero">Número *</Label>
            <Input
              id="endereco.numero"
              {...register("endereco.numero")}
              placeholder="1000"
              disabled={isLoading}
            />
            {errors.endereco?.numero && (
              <span className="text-sm text-red-500">
                {errors.endereco.numero.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="endereco.complemento">Complemento</Label>
            <Input
              id="endereco.complemento"
              {...register("endereco.complemento")}
              placeholder="Sala 500"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="endereco.bairro">Bairro *</Label>
          <Input
            id="endereco.bairro"
            {...register("endereco.bairro")}
            placeholder="Bela Vista"
            disabled={isLoading}
          />
          {errors.endereco?.bairro && (
            <span className="text-sm text-red-500">
              {errors.endereco.bairro.message}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="endereco.cidade">Cidade *</Label>
            <Input
              id="endereco.cidade"
              {...register("endereco.cidade")}
              placeholder="São Paulo"
              disabled={isLoading}
            />
            {errors.endereco?.cidade && (
              <span className="text-sm text-red-500">
                {errors.endereco.cidade.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="endereco.uf">UF *</Label>
            <Input
              id="endereco.uf"
              {...register("endereco.uf")}
              placeholder="SP"
              maxLength={2}
              disabled={isLoading}
            />
            {errors.endereco?.uf && (
              <span className="text-sm text-red-500">
                {errors.endereco.uf.message}
              </span>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="endereco.cep">CEP *</Label>
          <Input
            id="endereco.cep"
            {...register("endereco.cep")}
            placeholder="01311-100"
            disabled={isLoading}
          />
          {errors.endereco?.cep && (
            <span className="text-sm text-red-500">
              {errors.endereco.cep.message}
            </span>
          )}
        </div>
      </fieldset>

      {/* Administrator Account Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Conta do Administrador</legend>

        <div>
          <Label htmlFor="admin.nome">Nome do Administrador *</Label>
          <Input
            id="admin.nome"
            {...register("admin.nome")}
            placeholder="Maria Silva"
            disabled={isLoading}
          />
          {errors.admin?.nome && (
            <span className="text-sm text-red-500">
              {errors.admin.nome.message}
            </span>
          )}
        </div>

        <div>
          <Label htmlFor="admin.email">E-mail do Administrador *</Label>
          <Input
            id="admin.email"
            type="email"
            {...register("admin.email")}
            placeholder="admin@clinic.com"
            disabled={isLoading}
          />
          {errors.admin?.email && (
            <span className="text-sm text-red-500">
              {errors.admin.email.message}
            </span>
          )}
        </div>

        <div>
          <Label htmlFor="admin.cpf">CPF (opcional)</Label>
          <Input
            id="admin.cpf"
            {...register("admin.cpf")}
            placeholder="123.456.789-00"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="admin.telefone">Telefone (opcional)</Label>
          <Input
            id="admin.telefone"
            {...register("admin.telefone")}
            placeholder="+55 11 98765-4321"
            disabled={isLoading}
          />
        </div>

        <div>
          <Label htmlFor="admin.senha">Senha *</Label>
          <Input
            id="admin.senha"
            type="password"
            {...register("admin.senha")}
            placeholder="••••••••"
            disabled={isLoading}
          />
          {errors.admin?.senha && (
            <span className="text-sm text-red-500">
              {errors.admin.senha.message}
            </span>
          )}
        </div>

        <div>
          <Label htmlFor="confirmaSenha">Confirmar Senha *</Label>
          <Input
            id="confirmaSenha"
            type="password"
            {...register("confirmaSenha")}
            placeholder="••••••••"
            disabled={isLoading}
          />
          {errors.confirmaSenha && (
            <span className="text-sm text-red-500">
              {errors.confirmaSenha.message}
            </span>
          )}
        </div>
      </fieldset>

      {/* Customization Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">
          Personalização (opcional)
        </legend>

        <div>
          <Label htmlFor="personalizacao.logoUrl">URL da Logo</Label>
          <Input
            id="personalizacao.logoUrl"
            {...register("personalizacao.logoUrl")}
            type="url"
            placeholder="https://example.com/logo.png"
            disabled={isLoading}
          />
          {errors.personalizacao?.logoUrl && (
            <span className="text-sm text-red-500">
              {errors.personalizacao.logoUrl.message}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="personalizacao.corPrimaria">Cor Primária</Label>
            <div className="flex gap-2">
              <Input
                id="personalizacao.corPrimaria"
                {...register("personalizacao.corPrimaria")}
                type="color"
                placeholder="#FF0000"
                disabled={isLoading}
                className="w-16 h-10 cursor-pointer"
              />
              <Input
                {...register("personalizacao.corPrimaria")}
                placeholder="#FF0000"
                disabled={isLoading}
              />
            </div>
            {errors.personalizacao?.corPrimaria && (
              <span className="text-sm text-red-500">
                {errors.personalizacao.corPrimaria.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="personalizacao.corSecundaria">Cor Secundária</Label>
            <div className="flex gap-2">
              <Input
                id="personalizacao.corSecundaria"
                {...register("personalizacao.corSecundaria")}
                type="color"
                placeholder="#00FF00"
                disabled={isLoading}
                className="w-16 h-10 cursor-pointer"
              />
              <Input
                {...register("personalizacao.corSecundaria")}
                placeholder="#00FF00"
                disabled={isLoading}
              />
            </div>
            {errors.personalizacao?.corSecundaria && (
              <span className="text-sm text-red-500">
                {errors.personalizacao.corSecundaria.message}
              </span>
            )}
          </div>
        </div>
      </fieldset>

      {/* LGPD Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Termos e Condições</legend>

        <div className="flex items-start gap-2">
          <Checkbox
            id="aceitouTermoLGPD"
            checked={aceitouTermoLGPD}
            onCheckedChange={(checked) =>
              setValue("aceitouTermoLGPD", checked as boolean)
            }
            disabled={isLoading}
          />
          <Label htmlFor="aceitouTermoLGPD" className="text-sm">
            Aceito os termos de proteção de dados (LGPD) *
          </Label>
        </div>
        {errors.aceitouTermoLGPD && (
          <span className="text-sm text-red-500">
            {errors.aceitouTermoLGPD.message}
          </span>
        )}
      </fieldset>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Criando clínica..." : "Criar Clínica"}
      </Button>
    </form>
  );
}
