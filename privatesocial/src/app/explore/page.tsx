import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const creators = await prisma.user.findMany({
    where: { isCreator: true },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { posts: true, subscriptionsAsCreator: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Explorar criadores</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {creators.map((c) => (
          <Link
            key={c.id}
            href={`/u/${c.username}`}
            className="block bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden hover:border-neutral-700"
          >
            <div
              className="h-24 bg-cover bg-center"
              style={{ backgroundImage: `url(${c.bannerUrl ?? "https://picsum.photos/seed/" + c.id + "/600/200"})` }}
            />
            <div className="p-3 flex items-center gap-3">
              {c.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.avatarUrl} alt="" className="w-12 h-12 rounded-full -mt-9 border-2 border-neutral-900 object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-neutral-700 -mt-9 border-2 border-neutral-900" />
              )}
              <div className="flex-1">
                <div className="font-semibold">{c.displayName}</div>
                <div className="text-xs text-neutral-400">@{c.username}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-brand-400">R$ {c.subscriptionPrice?.toFixed(2).replace(".", ",")}</div>
                <div className="text-xs text-neutral-500">{c._count.subscriptionsAsCreator} assinantes</div>
              </div>
            </div>
            {c.bio && <p className="text-xs text-neutral-400 px-3 pb-3">{c.bio}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
