import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpando dados antigos...");
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.media.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("senha123", 10);

  console.log("Criando usuários...");

  const luna = await prisma.user.create({
    data: {
      email: "luna@privatesocial.dev",
      username: "luna",
      displayName: "Luna Star",
      passwordHash,
      bio: "Modelo, criadora de conteúdo exclusivo. Conteúdo novo toda semana ✨",
      avatarUrl: "https://i.pravatar.cc/300?img=47",
      bannerUrl: "https://picsum.photos/seed/luna-banner/1200/400",
      isCreator: true,
      subscriptionPrice: 29.9,
    },
  });

  const ravi = await prisma.user.create({
    data: {
      email: "ravi@privatesocial.dev",
      username: "ravifit",
      displayName: "Ravi Fit",
      passwordHash,
      bio: "Treinos, dieta e lifestyle. Conteúdos exclusivos pra assinantes.",
      avatarUrl: "https://i.pravatar.cc/300?img=12",
      bannerUrl: "https://picsum.photos/seed/ravi-banner/1200/400",
      isCreator: true,
      subscriptionPrice: 19.9,
    },
  });

  const fan = await prisma.user.create({
    data: {
      email: "fan@privatesocial.dev",
      username: "fanboy",
      displayName: "Carlos Fã",
      passwordHash,
      bio: "Só assistindo o show.",
      avatarUrl: "https://i.pravatar.cc/300?img=33",
      isCreator: false,
    },
  });

  console.log("Criando posts...");
  await prisma.post.create({
    data: {
      authorId: luna.id,
      caption: "Bom dia, amores! Foto nova no perfil 💕",
      isPaid: false,
      media: {
        create: [
          { url: "https://picsum.photos/seed/luna1/800/1000", type: "image" },
        ],
      },
    },
  });

  await prisma.post.create({
    data: {
      authorId: luna.id,
      caption: "Conteúdo exclusivo pros meus assinantes 🔥 (assina pra ver)",
      isPaid: true,
      media: {
        create: [
          { url: "https://picsum.photos/seed/luna-paid1/800/1000", type: "image" },
          { url: "https://picsum.photos/seed/luna-paid2/800/1000", type: "image" },
        ],
      },
    },
  });

  await prisma.post.create({
    data: {
      authorId: ravi.id,
      caption: "Treino de costas de hoje. Bora!",
      isPaid: false,
      media: {
        create: [
          { url: "https://picsum.photos/seed/ravi1/800/1000", type: "image" },
        ],
      },
    },
  });

  await prisma.post.create({
    data: {
      authorId: ravi.id,
      caption: "Programa de treino completo + dieta — exclusivo!",
      isPaid: true,
      media: {
        create: [
          { url: "https://picsum.photos/seed/ravi-paid/800/1000", type: "image" },
        ],
      },
    },
  });

  console.log("\n✅ Seed concluído!");
  console.log("Usuários criados (senha: senha123):");
  console.log("  - luna@privatesocial.dev  (criadora)");
  console.log("  - ravi@privatesocial.dev  (criador)");
  console.log("  - fan@privatesocial.dev   (fã)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
