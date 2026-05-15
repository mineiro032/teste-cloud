"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Heart, Compass, Upload, User, LogOut, LogIn } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <header className="sticky top-0 z-30 bg-neutral-950/80 backdrop-blur border-b border-neutral-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <span className="font-bold text-lg">PrivateSocial</span>
        </Link>

        <nav className="flex items-center gap-4 text-neutral-300">
          <Link href="/explore" className="hover:text-white flex items-center gap-1">
            <Compass className="w-5 h-5" />
            <span className="hidden sm:inline">Explorar</span>
          </Link>
          {user?.isCreator && (
            <Link href="/upload" className="hover:text-white flex items-center gap-1">
              <Upload className="w-5 h-5" />
              <span className="hidden sm:inline">Postar</span>
            </Link>
          )}
          {user ? (
            <>
              <Link href={`/u/${user.username}`} className="hover:text-white flex items-center gap-1">
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">@{user.username}</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-neutral-400 hover:text-white"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <Link href="/login" className="bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1">
              <LogIn className="w-4 h-4" />
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
