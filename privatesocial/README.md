# PrivateSocial

Rede social de criadores com sistema de assinatura e paywall — inspirado em Privacy/OnlyFans.
MVP funcional pra rodar local em alguns minutos.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** pra UI
- **Prisma** + **SQLite** (zero setup de banco)
- **NextAuth** com credenciais (email + senha)
- **lucide-react** pra ícones
- Pagamento e armazenamento de mídia **mockados** (estrutura pronta pra plugar Stripe/Mercado Pago e S3/Cloudinary depois)

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Criar o banco de dados local + popular com dados de exemplo
npx prisma db push
npm run db:seed

# 3. Subir o servidor
npm run dev
```

Abra http://localhost:3000

### Usuários de teste (senha: `senha123`)
- `luna@privatesocial.dev` — criadora (Luna Star, R$ 29,90/mês)
- `ravi@privatesocial.dev` — criador (Ravi Fit, R$ 19,90/mês)
- `fan@privatesocial.dev` — fã (pra testar assinatura)

## Estrutura

```
privatesocial/
├── prisma/
│   ├── schema.prisma       # User, Post, Media, Subscription, Like, Comment
│   └── seed.ts             # dados iniciais
├── public/uploads/         # mídia local enviada (gitignored)
├── src/
│   ├── app/
│   │   ├── page.tsx                  # feed
│   │   ├── explore/page.tsx          # lista de criadores
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── upload/page.tsx           # criador posta foto/vídeo
│   │   ├── subscriptions/page.tsx    # minhas assinaturas
│   │   ├── u/[username]/page.tsx     # perfil público de criador
│   │   └── api/
│   │       ├── auth/[...nextauth]/   # NextAuth
│   │       ├── register/             # cadastro
│   │       ├── upload/               # upload de arquivos
│   │       ├── posts/                # criar post, like
│   │       └── subscribe/            # assinar/cancelar
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── PostCard.tsx              # card com paywall
│   │   ├── PostCardWrapper.tsx
│   │   └── SubscribeButton.tsx
│   └── lib/
│       ├── prisma.ts
│       ├── auth.ts                   # config do NextAuth
│       └── subscriptions.ts          # checa assinatura ativa
└── .env                              # DATABASE_URL, NEXTAUTH_SECRET
```

## O que está funcionando

- ✅ Cadastro de usuários comuns e criadores (com preço de assinatura)
- ✅ Login/logout via email + senha
- ✅ Feed de posts (públicos + bloqueados)
- ✅ Exploração de criadores
- ✅ Página de perfil com banner, bio, posts e botão "Assinar"
- ✅ Upload local de fotos e vídeos (até 50MB)
- ✅ Posts free vs. posts exclusivos (paywall com blur)
- ✅ Assinatura mock (1 clique, vale 30 dias)
- ✅ Like em posts
- ✅ Página "Minhas assinaturas"

## Próximos passos pra produção

### Pagamento real
Trocar o mock em `src/app/api/subscribe/route.ts` por:
- **Stripe** (internacional): Stripe Subscriptions + Webhook `/api/webhooks/stripe`
- **Mercado Pago** (Brasil): Preapproval API + Webhook

Fluxo recomendado:
1. Botão "Assinar" → POST `/api/subscribe/checkout` → cria sessão de pagamento → retorna URL
2. Redirect pro checkout do provedor
3. Webhook recebe confirmação → cria/renova `Subscription` no banco

### Armazenamento de mídia
Substituir gravação em `public/uploads/` por:
- **AWS S3** + CloudFront (URLs assinadas pra mídia paga)
- **Cloudinary** (mais fácil, transcodifica vídeo automaticamente)
- **Mux** (streaming de vídeo profissional, recomendado)

### Banco de dados
Trocar SQLite por PostgreSQL em produção:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Recomendados: Neon, Supabase, Railway.

### Outras melhorias
- Comentários (modelo já existe, falta UI)
- DMs entre fã e criador
- Notificações
- Painel do criador (estatísticas, ganhos, saque)
- Verificação de idade e KYC (essencial em prod)
- Moderação de conteúdo (ex: AWS Rekognition)
- Termos de uso + política de privacidade (LGPD)
- Rate limiting nas APIs
- 2FA

## Avisos

- O sistema atual **não verifica idade nem identidade**. Antes de qualquer produção, implemente KYC e revise leis locais (LGPD no Brasil, idade mínima de criadores, etc.).
- Conteúdo adulto, se for esse o caso, exige hospedagem compatível (a Vercel proíbe NSFW em produção — considere Render, Railway, fly.io).
- O `NEXTAUTH_SECRET` no `.env` é só pra dev. Gere um novo com `openssl rand -base64 32` antes de subir.
