"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { registerClinic } from "@/lib/api/auth";
import type { ClinicFormData } from "@/lib/mappers/registration";

const schema = z.object({
  razaoSocial: z.string().min(3),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/),
  endereco: z.object({
    rua: z.string().min(1),
    numero: z.string().min(1),
    complemento: z.string().optional(),
    bairro: z.string().min(1),
    cidade: z.string().min(1),
    uf: z.string().length(2),
    cep: z.string().regex(/^\d{5}-?\d{3}$/),
  }),
  admin: z.object({
    nome: z.string().min(3),
    email: z.string().email(),
    cpf: z.string().optional(),
    telefone: z.string().optional(),
    senha: z.string().min(8),
  }),
  confirmaSenha: z.string(),
  personalizacao: z.object({
    logoUrl: z.string().url().optional().or(z.literal("")),
    corPrimaria: z.string().regex(/^#[0-9A-F]{6}$/i).optional().or(z.literal("")),
    corSecundaria: z.string().regex(/^#[0-9A-F]{6}$/i).optional().or(z.literal("")),
  }).optional(),
  aceitouTermoLGPD: z.boolean().refine(v => v === true),
}).refine(d => d.admin.senha === d.confirmaSenha, {
  message: "Senhas não conferem",
  path: ["confirmaSenha"],
});

type FormData = z.infer<typeof schema>;

export function RegisterClinicForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const formData: ClinicFormData = {
        ...data,
        endereco: {
          ...data.endereco,
          cep: data.endereco.cep.replace("-", ""),
        },
      };

      const result = await registerClinic(formData);
      if (result.success) {
        toast.success("Cadastro realizado!");
        router.push("/auth/email-confirmation");
      } else {
        toast.error(result.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div>
        <label>Razão Social *</label>
        <input {...register("razaoSocial")} className="border w-full p-2" />
        {errors.razaoSocial && <span className="text-red-500 text-sm">{errors.razaoSocial.message}</span>}
      </div>

      <div>
        <label>CNPJ *</label>
        <input {...register("cnpj")} placeholder="00.000.000/0000-00" className="border w-full p-2" />
        {errors.cnpj && <span className="text-red-500 text-sm">{errors.cnpj.message}</span>}
      </div>

      <div>
        <label>Rua *</label>
        <input {...register("endereco.rua")} className="border w-full p-2" />
        {errors.endereco?.rua && <span className="text-red-500 text-sm">{errors.endereco.rua.message}</span>}
      </div>

      <div>
        <label>Número *</label>
        <input {...register("endereco.numero")} className="border w-full p-2" />
        {errors.endereco?.numero && <span className="text-red-500 text-sm">{errors.endereco.numero.message}</span>}
      </div>

      <div>
        <label>Complemento</label>
        <input {...register("endereco.complemento")} className="border w-full p-2" />
      </div>

      <div>
        <label>Bairro *</label>
        <input {...register("endereco.bairro")} className="border w-full p-2" />
        {errors.endereco?.bairro && <span className="text-red-500 text-sm">{errors.endereco.bairro.message}</span>}
      </div>

      <div>
        <label>Cidade *</label>
        <input {...register("endereco.cidade")} className="border w-full p-2" />
        {errors.endereco?.cidade && <span className="text-red-500 text-sm">{errors.endereco.cidade.message}</span>}
      </div>

      <div>
        <label>UF *</label>
        <input {...register("endereco.uf")} maxLength={2} className="border w-full p-2" />
        {errors.endereco?.uf && <span className="text-red-500 text-sm">{errors.endereco.uf.message}</span>}
      </div>

      <div>
        <label>CEP *</label>
        <input {...register("endereco.cep")} placeholder="00000-000" className="border w-full p-2" />
        {errors.endereco?.cep && <span className="text-red-500 text-sm">{errors.endereco.cep.message}</span>}
      </div>

      <div>
        <label>Nome do Admin *</label>
        <input {...register("admin.nome")} className="border w-full p-2" />
        {errors.admin?.nome && <span className="text-red-500 text-sm">{errors.admin.nome.message}</span>}
      </div>

      <div>
        <label>Email do Admin *</label>
        <input {...register("admin.email")} type="email" className="border w-full p-2" />
        {errors.admin?.email && <span className="text-red-500 text-sm">{errors.admin.email.message}</span>}
      </div>

      <div>
        <label>CPF do Admin</label>
        <input {...register("admin.cpf")} className="border w-full p-2" />
      </div>

      <div>
        <label>Telefone do Admin</label>
        <input {...register("admin.telefone")} className="border w-full p-2" />
      </div>

      <div>
        <label>Senha *</label>
        <input {...register("admin.senha")} type="password" className="border w-full p-2" />
        {errors.admin?.senha && <span className="text-red-500 text-sm">{errors.admin.senha.message}</span>}
      </div>

      <div>
        <label>Confirmar Senha *</label>
        <input {...register("confirmaSenha")} type="password" className="border w-full p-2" />
        {errors.confirmaSenha && <span className="text-red-500 text-sm">{errors.confirmaSenha.message}</span>}
      </div>

      <div>
        <label>Logo URL</label>
        <input {...register("personalizacao.logoUrl")} type="url" className="border w-full p-2" />
      </div>

      <div>
        <label>Cor Primária</label>
        <input {...register("personalizacao.corPrimaria")} type="color" className="border w-full p-2" />
      </div>

      <div>
        <label>Cor Secundária</label>
        <input {...register("personalizacao.corSecundaria")} type="color" className="border w-full p-2" />
      </div>

      <div className="flex items-center gap-2">
        <input {...register("aceitouTermoLGPD")} type="checkbox" id="lgpd" />
        <label htmlFor="lgpd">Aceito os termos LGPD *</label>
      </div>
      {errors.aceitouTermoLGPD && <span className="text-red-500 text-sm">{errors.aceitouTermoLGPD.message}</span>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white p-2 rounded disabled:bg-gray-400"
      >
        {isLoading ? "Criando..." : "Criar Clínica"}
      </button>
    </form>
  );
}
