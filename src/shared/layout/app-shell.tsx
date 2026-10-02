"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";
import { LayoutDashboard, ShoppingBasket, Receipt, Cookie, Menu, X, LogOut, Scale } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { Button } from "@/shared/components/ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/ingredientes", label: "Ingredientes", Icon: ShoppingBasket },
  { href: "/pesquisa-precos", label: "Preços", Icon: Scale },
  { href: "/vendas", label: "Vendidos", Icon: Receipt },
  { href: "/produtos", label: "Produtos", Icon: Cookie },
];

export function AppShell({ userEmail, children }: { userEmail: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex shrink-0 items-center gap-2">
            <button
              className="mr-1 flex size-9 items-center justify-center rounded-lg hover:bg-surface-hover md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Abrir menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={menuOpen ? "close" : "open"}
                  initial={{ rotate: -45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 45, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </motion.span>
              </AnimatePresence>
            </button>
            <Cookie className="size-6 shrink-0 text-primary" />
            <span className="whitespace-nowrap font-display text-lg font-semibold">Doce Controle</span>
          </div>

          <nav className="hidden items-center gap-0.5 md:flex lg:gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "relative flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition-colors lg:px-3",
                    active ? "text-primary-foreground" : "text-foreground hover:bg-surface-hover"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <item.Icon className="relative size-4 shrink-0" />
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden max-w-40 truncate text-sm text-muted-foreground lg:inline">
              {userEmail}
            </span>
            <ThemeToggle />
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" />
              <span className="hidden md:inline">Sair</span>
            </Button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex flex-col gap-1 overflow-hidden border-t border-border px-4 md:hidden"
            >
              <div className="flex flex-col gap-1 py-3">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={clsx(
                        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-surface-hover"
                      )}
                    >
                      <item.Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
