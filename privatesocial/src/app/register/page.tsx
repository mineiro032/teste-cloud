"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
    isCreator: false,
    subscriptionPrice: 19.9,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro no cadastro");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Criar conta</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          required
          placeholder="Nome de exibição"
          value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2"
        />
        <input
          required
          placeholder="Nome de usuário (ex: maria_silva)"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2"
        />
        <input
          required
          type="password"
          placeholder="Senha (mín 6 caracteres)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isCreator}
            onChange={(e) => setForm({ ...form, isCreator: e.target.checked })}
            className="w-4 h-4"
          />
          Sou criador (quero monetizar meu perfil)
        </label>

        {form.isCreator && (
          <div>
            <label className="text-sm text-neutral-300 block mb-1">Preço mensal da assinatura (R$)</label>
            <input
              type="number"
              min={1}
              max={999}
              step={0.1}
              value={form.subscriptionPrice}
              onChange={(e) => setForm({ ...form, subscriptionPrice: Number(e.target.value) })}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2"
            />
          </div>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          disabled={loading}
          type="submit"
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 py-2 rounded-md font-medium"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>
      <p className="text-sm text-neutral-400 mt-4 text-center">
        Já tem conta? <Link href="/login" className="text-brand-400 hover:underline">Entrar</Link>
      </p>
    </div>
  );
}
