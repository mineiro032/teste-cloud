"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UploadCloud, Image as ImageIcon, Trash2, Lock } from "lucide-react";

type UploadedMedia = { url: string; type: "image" | "video" };

export default function UploadPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user as any;

  const [caption, setCaption] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading") return <p className="text-neutral-400">Carregando...</p>;
  if (!user) {
    return (
      <div>
        <p className="text-neutral-400">Você precisa estar logado.</p>
      </div>
    );
  }
  if (!user.isCreator) {
    return (
      <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 mt-6">
        <h1 className="text-xl font-bold mb-2">Conta de criador necessária</h1>
        <p className="text-neutral-300 text-sm">
          Sua conta atual não é de criador. Crie uma nova conta marcando "Sou criador" para conseguir postar.
        </p>
      </div>
    );
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    setUploading(true);
    setError("");
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Falha no upload");
        continue;
      }
      const data = await res.json();
      setMedia((m) => [...m, { url: data.url, type: data.type }]);
    }
    setUploading(false);
  }

  async function submit() {
    if (media.length === 0) {
      setError("Adicione pelo menos uma foto ou vídeo.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ caption, isPaid, media }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erro ao publicar");
      return;
    }
    router.push(`/u/${user.username}`);
    router.refresh();
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Novo post</h1>

      <label className="block">
        <div className="border-2 border-dashed border-neutral-700 rounded-xl p-8 text-center cursor-pointer hover:border-brand-500 hover:bg-neutral-900">
          <UploadCloud className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
          <p className="text-sm text-neutral-300">Clique pra escolher fotos ou vídeos</p>
          <p className="text-xs text-neutral-500 mt-1">jpg, png, webp, mp4, webm · até 50MB cada</p>
        </div>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </label>

      {uploading && <p className="text-xs text-neutral-400 mt-2">Enviando...</p>}

      {media.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {media.map((m, i) => (
            <div key={i} className="relative aspect-square bg-neutral-900 rounded-md overflow-hidden">
              {m.type === "video" ? (
                <video src={m.url} className="w-full h-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              )}
              <button
                type="button"
                onClick={() => setMedia(media.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-1 hover:bg-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <textarea
        placeholder="Escreva uma legenda..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        rows={3}
        className="w-full bg-neutral-900 border border-neutral-700 rounded-md px-3 py-2 mt-4 resize-none"
      />

      <label className="flex items-center gap-2 mt-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isPaid}
          onChange={(e) => setIsPaid(e.target.checked)}
          className="w-4 h-4"
        />
        <Lock className="w-4 h-4 text-brand-400" />
        <span className="text-sm">Post exclusivo (somente assinantes podem ver)</span>
      </label>

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

      <button
        onClick={submit}
        disabled={submitting || uploading || media.length === 0}
        className="w-full mt-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 py-2.5 rounded-md font-medium"
      >
        {submitting ? "Publicando..." : "Publicar"}
      </button>
    </div>
  );
}
