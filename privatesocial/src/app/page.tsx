import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/subscriptions";
import { PostCardData } from "@/components/PostCard";
import PostCardWrapper from "@/components/PostCardWrapper";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      author: true,
      media: true,
      _count: { select: { likes: true, comments: true } },
      likes: userId ? { where: { userId }, select: { id: true } } : false,
    },
  });

  const data: PostCardData[] = await Promise.all(
    posts.map(async (p) => {
      const unlocked = !p.isPaid || (await hasActiveSubscription(userId, p.authorId));
      return {
        id: p.id,
        caption: p.caption,
        isPaid: p.isPaid,
        createdAt: p.createdAt.toISOString(),
        author: {
          id: p.author.id,
          username: p.author.username,
          displayName: p.author.displayName,
          avatarUrl: p.author.avatarUrl,
          subscriptionPrice: p.author.subscriptionPrice,
        },
        media: unlocked ? p.media.map((m) => ({ id: m.id, url: m.url, type: m.type })) : [],
        likesCount: p._count.likes,
        commentsCount: p._count.comments,
        unlocked,
        likedByMe: Array.isArray(p.likes) ? p.likes.length > 0 : false,
      };
    }),
  );

  return (
    <div>
      {!session && (
        <div className="bg-gradient-to-r from-brand-700 to-brand-500 p-6 rounded-xl mb-6">
          <h1 className="text-2xl font-bold mb-1">Bem-vindo ao PrivateSocial</h1>
          <p className="text-white/90 mb-3">Conteúdo exclusivo direto dos seus criadores favoritos.</p>
          <div className="flex gap-2">
            <Link href="/register" className="bg-white text-brand-700 px-4 py-2 rounded-md font-medium">Criar conta</Link>
            <Link href="/login" className="bg-black/30 text-white px-4 py-2 rounded-md font-medium hover:bg-black/40">Entrar</Link>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Feed</h2>
      {data.length === 0 ? (
        <p className="text-neutral-400">Nada por aqui ainda.</p>
      ) : (
        data.map((p) => <PostCardWrapper key={p.id} post={p} />)
      )}
    </div>
  );
}
