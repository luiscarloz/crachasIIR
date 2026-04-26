"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

const navItems = [
  { href: "/dashboard", label: "Check-in" },
  { href: "/dashboard/voluntarios", label: "Voluntarios" },
  { href: "/dashboard/relatorios", label: "Relatorios" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#f4f1ea]">
      <nav className="bg-white/95 shadow-sm border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-3">
                <Image
                  src="/iir-logo.svg"
                  alt="IIR"
                  width={51}
                  height={36}
                  className="h-9 w-auto"
                  priority
                />
                <span className="sr-only">IIR</span>
              </Link>
              <div className="flex gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? "bg-stone-950 text-white"
                        : "text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-stone-500 hover:text-stone-900"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
