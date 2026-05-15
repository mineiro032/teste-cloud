"use client";

import { useRouter } from "next/navigation";
import PostCard, { PostCardData } from "./PostCard";

export default function PostCardWrapper({ post }: { post: PostCardData }) {
  const router = useRouter();
  async function subscribe() {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ creatorId: post.author.id }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Não foi possível assinar. Faça login primeiro.");
      if (res.status === 401) router.push("/login");
    }
  }
  return <PostCard post={post} onSubscribeClick={subscribe} />;
}
