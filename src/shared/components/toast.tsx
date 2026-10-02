"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

type TipoToast = "erro" | "sucesso";
type ItemToast = { id: number; tipo: TipoToast; mensagem: string };

type ToastApi = {
  erro: (mensagem: string) => void;
  sucesso: (mensagem: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const DURACAO_MS: Record<TipoToast, number> = { erro: 8000, sucesso: 4000 };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemToast[]>([]);
  const proximoId = useRef(1);

  const remover = useCallback((id: number) => {
    setItens((atual) => atual.filter((t) => t.id !== id));
  }, []);

  const adicionar = useCallback(
    (tipo: TipoToast, mensagem: string) => {
      const id = proximoId.current++;
      setItens((atual) => [...atual.slice(-3), { id, tipo, mensagem }]);
      window.setTimeout(() => remover(id), DURACAO_MS[tipo]);
    },
    [remover]
  );

  const api = useMemo<ToastApi>(
    () => ({
      erro: (mensagem) => adicionar("erro", mensagem),
      sucesso: (mensagem) => adicionar("sucesso", mensagem),
    }),
    [adicionar]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
      >
        <AnimatePresence initial={false}>
          {itens.map((t) => (
            <motion.div
              key={t.id}
              role={t.tipo === "erro" ? "alert" : "status"}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={clsx(
                "pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-xl border px-3 py-2.5 text-sm shadow-lg",
                t.tipo === "erro"
                  ? "border-danger/30 bg-danger-bg text-danger"
                  : "border-success/30 bg-success-bg text-success"
              )}
            >
              {t.tipo === "erro" ? (
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
              ) : (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              )}
              <p className="flex-1">{t.mensagem}</p>
              <button
                onClick={() => remover(t.id)}
                aria-label="Fechar aviso"
                className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>.");
  return ctx;
}
