import { prisma } from "./prisma";

/**
 * Verifica se um usuário tem assinatura ativa de um criador.
 */
export async function hasActiveSubscription(
  subscriberId: string | null | undefined,
  creatorId: string,
): Promise<boolean> {
  if (!subscriberId) return false;
  if (subscriberId === creatorId) return true; // o próprio criador vê tudo
  const sub = await prisma.subscription.findUnique({
    where: { subscriberId_creatorId: { subscriberId, creatorId } },
  });
  if (!sub) return false;
  return sub.active && sub.expiresAt > new Date();
}
