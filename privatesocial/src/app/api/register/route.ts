import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20).regex(/^[a-z0-9_]+$/, "use apenas a-z, 0-9 e _"),
  displayName: z.string().min(2).max(40),
  password: z.string().min(6).max(100),
  isCreator: z.boolean().optional(),
  subscriptionPrice: z.number().min(1).max(999).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const exists = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email.toLowerCase() }, { username: data.username.toLowerCase() }],
      },
    });
    if (exists) {
      return NextResponse.json({ error: "Email ou usuário já cadastrado" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        username: data.username.toLowerCase(),
        displayName: data.displayName,
        passwordHash,
        isCreator: data.isCreator ?? false,
        subscriptionPrice: data.isCreator ? data.subscriptionPrice ?? 19.9 : null,
      },
    });

    return NextResponse.json({ id: user.id, username: user.username });
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Dados inválidos" }, { status: 400 });
    }
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
