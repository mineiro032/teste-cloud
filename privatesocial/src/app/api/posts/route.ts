import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  caption: z.string().max(2000).optional(),
  isPaid: z.boolean(),
  media: z
    .array(z.object({ url: z.string(), type: z.enum(["image", "video"]) }))
    .min(1)
    .max(10),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!user.isCreator) return NextResponse.json({ error: "Apenas criadores podem postar" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const post = await prisma.post.create({
    data: {
      authorId: user.id,
      caption: parsed.data.caption ?? null,
      isPaid: parsed.data.isPaid,
      media: { create: parsed.data.media },
    },
  });

  return NextResponse.json({ id: post.id });
}
