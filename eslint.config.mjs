import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Regra de arquitetura (docs/ARQUITETURA.md): uma feature nao importa de outra;
// codigo comum vive em src/shared.
const FEATURES = ["dashboard", "vendas", "produtos", "ingredientes", "precos"];
const isolamentoDeFeatures = FEATURES.map((feature) => ({
  files: [`src/features/${feature}/**/*.{ts,tsx}`],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: FEATURES.filter((f) => f !== feature).map((f) => `@/features/${f}/**`),
            message: "Features nao importam umas das outras: mova o codigo comum para src/shared.",
          },
        ],
      },
    ],
  },
}));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This app fetches on mount in client components (no data-fetching
      // library) and uses the standard next-themes "mounted" guard; both are
      // deliberate setState-in-effect patterns, not accidental ones.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  ...isolamentoDeFeatures,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
