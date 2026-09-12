import { LoginForm } from "./login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary text-2xl text-primary-foreground">
            🍪
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Doce Controle</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre para gerenciar suas compras, vendas e produtos.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
