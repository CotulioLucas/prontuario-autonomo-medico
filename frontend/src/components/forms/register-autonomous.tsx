"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { registerAutonomous } from "@/lib/api/auth";
import type { AutonomousFormData } from "@/lib/mappers/registration";

const schema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  telefone: z.string().min(10),
  senha: z.string().min(8),
  confirmaSenha: z.string(),
  tipoProfissional: z.string().min(1),
  conselho: z.enum(["CRM", "CRP", "CREFITO", "OUTRO"]),
  numeroRegistro: z.string().min(1),
  ufRegistro: z.string().length(2),
  endereco: z.object({
    rua: z.string().min(1),
    numero: z.string().min(1),
    complemento: z.string().optional(),
    bairro: z.string().min(1),
    cidade: z.string().min(1),
    uf: z.string().length(2),
    cep: z.string().regex(/^\d{5}-?\d{3}$/),
  }),
  aceitouTermoLGPD: z.boolean().refine(v => v === true),
}).refine(d => d.senha === d.confirmaSenha, {
  message: "Senhas não conferem",
  path: ["confirmaSenha"],
});

type FormData = z.infer<typeof schema>;

export function RegisterAutonomousForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const formData: AutonomousFormData = {
        ...data,
        endereco: {
          ...data.endereco,
          cep: data.endereco.cep.replace("-", ""),
        },
      };

      const result = await registerAutonomous(formData);
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
        <label>Nome *</label>
        <input {...register("nome")} className="border w-full p-2" />
        {errors.nome && <span className="text-red-500 text-sm">{errors.nome.message}</span>}
      </div>

      <div>
        <label>Email *</label>
        <input {...register("email")} type="email" className="border w-full p-2" />
        {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
      </div>

      <div>
        <label>Telefone *</label>
        <input {...register("telefone")} className="border w-full p-2" />
        {errors.telefone && <span className="text-red-500 text-sm">{errors.telefone.message}</span>}
      </div>

      <div>
        <label>Senha *</label>
        <input {...register("senha")} type="password" className="border w-full p-2" />
        {errors.senha && <span className="text-red-500 text-sm">{errors.senha.message}</span>}
      </div>

      <div>
        <label>Confirmar Senha *</label>
        <input {...register("confirmaSenha")} type="password" className="border w-full p-2" />
        {errors.confirmaSenha && <span className="text-red-500 text-sm">{errors.confirmaSenha.message}</span>}
      </div>

      <div>
        <label>Profissão *</label>
        <input {...register("tipoProfissional")} className="border w-full p-2" />
        {errors.tipoProfissional && <span className="text-red-500 text-sm">{errors.tipoProfissional.message}</span>}
      </div>

      <div>
        <label>Conselho *</label>
        <select {...register("conselho")} className="border w-full p-2">
          <option value="">Selecione</option>
          <option value="CRM">CRM</option>
          <option value="CRP">CRP</option>
          <option value="CREFITO">CREFITO</option>
          <option value="OUTRO">OUTRO</option>
        </select>
        {errors.conselho && <span className="text-red-500 text-sm">{errors.conselho.message}</span>}
      </div>

      <div>
        <label>Número de Registro *</label>
        <input {...register("numeroRegistro")} className="border w-full p-2" />
        {errors.numeroRegistro && <span className="text-red-500 text-sm">{errors.numeroRegistro.message}</span>}
      </div>

      <div>
        <label>UF do Registro *</label>
        <input {...register("ufRegistro")} maxLength={2} className="border w-full p-2" />
        {errors.ufRegistro && <span className="text-red-500 text-sm">{errors.ufRegistro.message}</span>}
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
        {isLoading ? "Criando..." : "Criar Conta"}
      </button>
    </form>
  );
}
