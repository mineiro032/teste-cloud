import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasActiveSubscription } from "@/lib/subscriptions";
import { PostCardData } from "@/components/PostCard";
import PostCardWrapper from "@/components/PostCardWrapper";
import SubscribeButton from "@/components/SubscribeButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  const viewerId = (session?.user as any)?.id as string | undefined;

  const user = await prisma.user.findUnique({
    where: { username: params.username.toLowerCase() },
    include: {
      _count: { select: { posts: true, subscriptionsAsCreator: true } },
      posts: {
        orderBy: { createdAt: "desc" },
        include: {
          media: true,
          author: true,
          _count: { select: { likes: true, comments: true } },
          likes: viewerId ? { where: { userId: viewerId }, select: { id: true } } : false,
        },
      },
    },
  });

  if (!user) notFound();

  const subscribed = await hasActiveSubscription(viewerId, user.id);

  const data: PostCardData[] = user.posts.map((p) => {
    const unlocked = !p.isPaid || subscribed || viewerId === user.id;
    return {
      id: p.id,
      caption: p.caption,
      isPaid: p.isPaid,
      createdAt: p.createdAt.toISOString(),
      author: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        subscriptionPrice: user.subscriptionPrice,
      },
      media: unlocked ? p.media.map((m) => ({ id: m.id, url: m.url, type: m.type })) : [],
      likesCount: p._count.likes,
      commentsCount: p._count.comments,
      unlocked,
      likedByMe: Array.isArray(p.likes) ? p.likes.length > 0 : false,
    };
  });

  return (
    <div>
      <div
        className="h-40 rounded-xl bg-cover bg-center mb-[-3rem]"
        style={{ backgroundImage: `url(${user.bannerUrl ?? "https://picsum.photos/seed/" + user.id + "/1200/400"})` }}
      />
      <div className="relative px-4 flex items-end gap-4">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-24 h-24 rounded-full border-4 border-neutral-950 object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full border-4 border-neutral-950 bg-neutral-800" />
        )}
        <div className="flex-1 pb-2">
          <h1 className="text-2xl font-bold">{user.displayName}</h1>
          <p className="text-sm text-neutral-400">@{user.username}</p>
        </div>
        {user.isCreator && viewerId !== user.id && (
          <SubscribeButton
            creatorId={user.id}
            creatorUsername={user.username}
            price={user.subscriptionPrice ?? 0}
            subscribed={subscribed}
          />
        )}
      </div>

      {user.bio && <p className="px-4 mt-4 text-neutral-200">{user.bio}</p>}

      <div className="px-4 mt-3 flex gap-4 text-sm text-neutral-400">
        <span><strong className="text-white">{user._count.posts}</strong> posts</span>
        {user.isCreator && (
          <span><strong className="text-white">{user._count.subscriptionsAsCreator}</strong> assinantes</span>
        )}
        {user.isCreator && user.subscriptionPrice && (
          <span>R$ {user.subscriptionPrice.toFixed(2).replace(".", ",")} / mês</span>
        )}
      </div>

      <div className="mt-6">
        {data.length === 0 ? (
          <p className="text-neutral-400 px-4">Esse perfil ainda não publicou nada.</p>
        ) : (
          data.map((p) => <PostCardWrapper key={p.id} post={p} />)
        )}
      </div>
    </div>
  );
}
