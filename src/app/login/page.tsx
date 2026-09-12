"use client";

import { motion } from "motion/react";
import { Cookie } from "lucide-react";
import { LoginForm } from "./login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.5, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 260, damping: 18 }}
            className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
          >
            <Cookie className="size-7" />
          </motion.div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Doce Controle</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre para gerenciar suas compras, vendas e produtos.
          </p>
        </div>
        <LoginForm />
      </motion.div>
    </div>
  );
}
