"use client";

import Link from "next/link";
import { Lock, Heart, MessageCircle } from "lucide-react";
import { useState } from "react";

type Media = { id: string; url: string; type: string };
type Author = { id: string; username: string; displayName: string; avatarUrl: string | null; subscriptionPrice: number | null };
export type PostCardData = {
  id: string;
  caption: string | null;
  isPaid: boolean;
  createdAt: string;
  author: Author;
  media: Media[];
  likesCount: number;
  commentsCount: number;
  unlocked: boolean; // true se o usuário pode ver a mídia
  likedByMe: boolean;
};

export default function PostCard({ post, onSubscribeClick }: { post: PostCardData; onSubscribeClick?: () => void }) {
  const [liked, setLiked] = useState(post.likedByMe);
  const [likes, setLikes] = useState(post.likesCount);

  async function toggleLike() {
    setLiked(!liked);
    setLikes((c) => c + (liked ? -1 : 1));
    await fetch(`/api/posts/${post.id}/like`, { method: "POST" }).catch(() => {});
  }

  return (
    <article className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden mb-4">
      <header className="flex items-center gap-3 p-3">
        <Link href={`/u/${post.author.username}`} className="flex items-center gap-3 flex-1">
          {post.author.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.author.avatarUrl} alt={post.author.displayName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-neutral-700" />
          )}
          <div>
            <div className="font-semibold">{post.author.displayName}</div>
            <div className="text-xs text-neutral-400">@{post.author.username}</div>
          </div>
        </Link>
        {post.isPaid && (
          <span className="text-xs bg-brand-600/20 text-brand-300 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Lock className="w-3 h-3" /> Exclusivo
          </span>
        )}
      </header>

      <div className="relative bg-black">
        {post.unlocked ? (
          <div className="grid grid-cols-1 gap-1">
            {post.media.map((m) =>
              m.type === "video" ? (
                <video key={m.id} src={m.url} controls className="w-full max-h-[600px] bg-black" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={m.id} src={m.url} alt="" className="w-full max-h-[600px] object-cover" />
              ),
            )}
          </div>
        ) : (
          <div className="aspect-[4/5] relative flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-neutral-900 to-black">
            <div className="absolute inset-0 backdrop-blur-2xl bg-black/30" />
            <div className="relative z-10">
              <Lock className="w-10 h-10 mx-auto mb-3 text-brand-400" />
              <p className="font-medium mb-1">Conteúdo exclusivo</p>
              <p className="text-sm text-neutral-400 mb-4">
                Assine @{post.author.username} para liberar este conteúdo.
              </p>
              <button
                onClick={onSubscribeClick}
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Assinar por R$ {(post.author.subscriptionPrice ?? 0).toFixed(2).replace(".", ",")} / mês
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={toggleLike} className="flex items-center gap-1 hover:text-brand-400">
            <Heart className={liked ? "w-5 h-5 text-brand-500" : "w-5 h-5"} fill={liked ? "currentColor" : "none"} />
            <span className="text-sm">{likes}</span>
          </button>
          <Link href={`/post/${post.id}`} className="flex items-center gap-1 hover:text-brand-400">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{post.commentsCount}</span>
          </Link>
        </div>
        {post.caption && <p className="text-sm whitespace-pre-wrap">{post.caption}</p>}
        <p className="text-xs text-neutral-500 mt-2">
          {new Date(post.createdAt).toLocaleString("pt-BR")}
        </p>
      </div>
    </article>
  );
}
