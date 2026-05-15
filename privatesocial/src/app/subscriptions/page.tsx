import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/login");

  const subs = await prisma.subscription.findMany({
    where: { subscriberId: userId, active: true, expiresAt: { gt: new Date() } },
    include: { creator: true },
    orderBy: { startedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Minhas assinaturas</h1>
      {subs.length === 0 ? (
        <p className="text-neutral-400">
          Você ainda não assina ninguém. <Link href="/explore" className="text-brand-400 hover:underline">Explorar criadores</Link>
        </p>
      ) : (
        <div className="space-y-3">
          {subs.map((s) => (
            <Link
              key={s.id}
              href={`/u/${s.creator.username}`}
              className="flex items-center gap-3 p-3 bg-neutral-900 rounded-xl border border-neutral-800 hover:border-neutral-700"
            >
              {s.creator.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.creator.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-neutral-700" />
              )}
              <div className="flex-1">
                <div className="font-semibold">{s.creator.displayName}</div>
                <div className="text-xs text-neutral-400">@{s.creator.username}</div>
              </div>
              <div className="text-right text-xs text-neutral-400">
                <div>R$ {s.priceAtPurchase.toFixed(2).replace(".", ",")}/mês</div>
                <div>renova {s.expiresAt.toLocaleDateString("pt-BR")}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
