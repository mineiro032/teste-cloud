import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * MOCK de pagamento:
 * - Em produção, aqui você cria uma sessão de checkout no Stripe/Mercado Pago,
 *   redireciona o usuário, e cria a Subscription no webhook após confirmação.
 * - Por enquanto, criamos a assinatura imediatamente (simulando aprovação).
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const creatorId = body?.creatorId as string | undefined;
  if (!creatorId) return NextResponse.json({ error: "creatorId ausente" }, { status: 400 });
  if (creatorId === user.id) return NextResponse.json({ error: "Não dá pra assinar você mesmo 😅" }, { status: 400 });

  const creator = await prisma.user.findUnique({ where: { id: creatorId } });
  if (!creator || !creator.isCreator) {
    return NextResponse.json({ error: "Criador não encontrado" }, { status: 404 });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const sub = await prisma.subscription.upsert({
    where: { subscriberId_creatorId: { subscriberId: user.id, creatorId } },
    update: { active: true, expiresAt, startedAt: new Date(), priceAtPurchase: creator.subscriptionPrice ?? 0 },
    create: {
      subscriberId: user.id,
      creatorId,
      expiresAt,
      priceAtPurchase: creator.subscriptionPrice ?? 0,
    },
  });

  return NextResponse.json({ id: sub.id, expiresAt: sub.expiresAt });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const creatorId = body?.creatorId as string | undefined;
  if (!creatorId) return NextResponse.json({ error: "creatorId ausente" }, { status: 400 });

  await prisma.subscription.updateMany({
    where: { subscriberId: user.id, creatorId },
    data: { active: false, expiresAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
