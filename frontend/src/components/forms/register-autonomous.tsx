"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { registerAutonomous } from "@/lib/api/auth";
import type { AutonomousFormData } from "@/lib/mappers/registration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Autonomous Professional Registration Form Validation Schema
 *
 * Validates form data before submission. All validations are for user experience
 * and error handling. Backend performs final validation.
 */
const autonomousSchema = z
  .object({
    nome: z
      .string()
      .min(3, "Nome deve ter pelo menos 3 caracteres")
      .max(100, "Nome não pode ter mais de 100 caracteres"),
    email: z
      .string()
      .email("E-mail inválido")
      .max(100, "E-mail não pode ter mais de 100 caracteres"),
    telefone: z
      .string()
      .regex(/^\+?[\d\s\-()]{10,}$/, "Telefone inválido"),
    senha: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Senha deve conter letras maiúsculas, minúsculas e números"
      ),
    confirmaSenha: z.string(),
    tipoProfissional: z
      .string()
      .min(1, "Selecione a profissão")
      .max(50, "Profissão inválida"),
    conselho: z
      .enum(["CRM", "CRP", "CREFITO", "OUTRO"], {
        errorMap: () => ({ message: "Conselho inválido" }),
      }),
    numeroRegistro: z
      .string()
      .min(1, "Número de registro obrigatório")
      .max(20, "Número de registro inválido"),
    ufRegistro: z
      .string()
      .length(2, "UF deve ter 2 caracteres (ex: SP)")
      .toUpperCase(),
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
    aceitouTermoLGPD: z
      .boolean()
      .refine(
        (val) => val === true,
        "Você deve aceitar os termos de LGPD"
      ),
  })
  .refine((data) => data.senha === data.confirmaSenha, {
    message: "Senhas não conferem",
    path: ["confirmaSenha"],
  });

type FormData = z.infer<typeof autonomousSchema>;

/**
 * Autonomous Professional Registration Form Component
 *
 * Handles registration of autonomous professionals (psychologists, physiotherapists, etc)
 * with form validation, API submission, and error handling.
 */
export function RegisterAutonomousForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(autonomousSchema),
    defaultValues: {
      aceitouTermoLGPD: false,
    },
  });

  const conselho = watch("conselho");
  const aceitouTermoLGPD = watch("aceitouTermoLGPD");

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      // Transform frontend data to match AutonomousFormData interface
      const formData: AutonomousFormData = {
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        senha: data.senha,
        confirmaSenha: data.confirmaSenha,
        tipoProfissional: data.tipoProfissional,
        conselho: data.conselho,
        numeroRegistro: data.numeroRegistro,
        ufRegistro: data.ufRegistro,
        endereco: {
          rua: data.endereco.rua,
          numero: data.endereco.numero,
          complemento: data.endereco.complemento || undefined,
          bairro: data.endereco.bairro,
          cidade: data.endereco.cidade,
          uf: data.endereco.uf,
          cep: data.endereco.cep.replace("-", ""),
        },
        aceitouTermoLGPD: true,
      };

      const result = await registerAutonomous(formData);

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
      {/* Personal Information Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Informações Pessoais</legend>

        <div>
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input
            id="nome"
            {...register("nome")}
            placeholder="João Silva"
            disabled={isLoading}
          />
          {errors.nome && (
            <span className="text-sm text-red-500">{errors.nome.message}</span>
          )}
        </div>

        <div>
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            placeholder="joao@example.com"
            disabled={isLoading}
          />
          {errors.email && (
            <span className="text-sm text-red-500">
              {errors.email.message}
            </span>
          )}
        </div>

        <div>
          <Label htmlFor="telefone">Telefone *</Label>
          <Input
            id="telefone"
            {...register("telefone")}
            placeholder="+55 11 98765-4321"
            disabled={isLoading}
          />
          {errors.telefone && (
            <span className="text-sm text-red-500">
              {errors.telefone.message}
            </span>
          )}
        </div>

        <div>
          <Label htmlFor="senha">Senha *</Label>
          <Input
            id="senha"
            type="password"
            {...register("senha")}
            placeholder="••••••••"
            disabled={isLoading}
          />
          {errors.senha && (
            <span className="text-sm text-red-500">{errors.senha.message}</span>
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

      {/* Professional Information Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Informações Profissionais</legend>

        <div>
          <Label htmlFor="tipoProfissional">Profissão *</Label>
          <Input
            id="tipoProfissional"
            {...register("tipoProfissional")}
            placeholder="ex: Psicólogo, Fisioterapeuta"
            disabled={isLoading}
          />
          {errors.tipoProfissional && (
            <span className="text-sm text-red-500">
              {errors.tipoProfissional.message}
            </span>
          )}
        </div>

        <div>
          <Label htmlFor="conselho">Conselho Profissional *</Label>
          <Select value={conselho || ""} onValueChange={(value) => setValue("conselho", value as any)}>
            <SelectTrigger id="conselho" disabled={isLoading}>
              <SelectValue placeholder="Selecione o conselho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CRM">CRM (Médico)</SelectItem>
              <SelectItem value="CRP">CRP (Psicólogo)</SelectItem>
              <SelectItem value="CREFITO">CREFITO (Fisioterapeuta)</SelectItem>
              <SelectItem value="OUTRO">Outro</SelectItem>
            </SelectContent>
          </Select>
          {errors.conselho && (
            <span className="text-sm text-red-500">
              {errors.conselho.message}
            </span>
          )}
        </div>

        <div>
          <Label htmlFor="numeroRegistro">Número de Registro *</Label>
          <Input
            id="numeroRegistro"
            {...register("numeroRegistro")}
            placeholder="ex: 123456"
            disabled={isLoading}
          />
          {errors.numeroRegistro && (
            <span className="text-sm text-red-500">
              {errors.numeroRegistro.message}
            </span>
          )}
        </div>

        <div>
          <Label htmlFor="ufRegistro">UF do Registro *</Label>
          <Input
            id="ufRegistro"
            {...register("ufRegistro")}
            placeholder="SP"
            maxLength={2}
            disabled={isLoading}
          />
          {errors.ufRegistro && (
            <span className="text-sm text-red-500">
              {errors.ufRegistro.message}
            </span>
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
            placeholder="Rua das Flores"
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
              placeholder="123"
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
              placeholder="Apto 101"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="endereco.bairro">Bairro *</Label>
          <Input
            id="endereco.bairro"
            {...register("endereco.bairro")}
            placeholder="Centro"
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
            placeholder="01234-567"
            disabled={isLoading}
          />
          {errors.endereco?.cep && (
            <span className="text-sm text-red-500">
              {errors.endereco.cep.message}
            </span>
          )}
        </div>
      </fieldset>

      {/* LGPD Section */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Termos e Condições</legend>

        <div className="flex items-start gap-2">
          <Checkbox
            id="aceitouTermoLGPD"
            checked={aceitouTermoLGPD}
            onCheckedChange={(checked) => setValue("aceitouTermoLGPD", checked as boolean)}
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
        {isLoading ? "Criando conta..." : "Criar Conta"}
      </Button>
    </form>
  );
}
