"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, Sparkles } from "lucide-react";

export default function SubscribeButton({
  creatorId,
  creatorUsername,
  price,
  subscribed,
}: {
  creatorId: string;
  creatorUsername: string;
  price: number;
  subscribed: boolean;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (!session) {
      router.push("/login");
      return;
    }
    if (subscribed) {
      if (!confirm(`Cancelar assinatura de @${creatorUsername}?`)) return;
      setLoading(true);
      await fetch("/api/subscribe", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ creatorId }),
      });
      setLoading(false);
      router.refresh();
      return;
    }
    setLoading(true);
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ creatorId }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Erro ao assinar.");
    }
  }

  if (subscribed) {
    return (
      <button
        onClick={handle}
        disabled={loading}
        className="px-4 py-2 rounded-md bg-neutral-800 border border-neutral-700 text-white font-medium flex items-center gap-2 hover:bg-neutral-700"
      >
        <Check className="w-4 h-4 text-green-400" />
        Assinando
      </button>
    );
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="px-4 py-2 rounded-md gradient-brand text-white font-medium flex items-center gap-2 disabled:opacity-50"
    >
      <Sparkles className="w-4 h-4" />
      {loading ? "Processando..." : `Assinar · R$ ${price.toFixed(2).replace(".", ",")}/mês`}
    </button>
  );
}
