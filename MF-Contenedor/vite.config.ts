import federation from "@originjs/vite-plugin-federation";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import EnvironmentPlugin from "vite-plugin-environment";
import { componentExposes } from "./federation-exposes";

// (Opcional) Quitar variables conflictivas de Windows
delete process.env["CommonProgramFiles(x86)"];
delete process.env["ProgramFiles(x86)"];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  console.log(`Modo de compilacion: `, mode, `\nVariables de entorno: `, env);

  const appName = env.VITE_APP_NAME;
  const port = parseInt(env.VITE_PORT, 10);
  const base = `/${appName}/`;

  // --- Aquí convertimos { Clave: ruta } → { "./Clave": "ruta" } ---
  const exposesConfig = Object.fromEntries(
    Object.entries(componentExposes).map(([key, path]) => [`./${key}`, path])
  );
  // ----------------------------------------------------------------

  const remotes = {
    Characters: env.VITE_REMOTE_ENTRY_CHARACTERS,
  };

  return {
    base,
    server: {
      host: true,
      port,
      cors: true,
    },
    preview: {
      port,
    },
    plugins: [
      react(),
      // Inyectar TODAS las VITE_* en el bundle de cliente
      EnvironmentPlugin("all"),
      // Configuración de Module Federation (usa las variables VITE_REMOTE_ENTRY_…)
      federation({
        name: appName,
        filename: "remoteEntry.js",
        exposes: exposesConfig,
        remotes,
        shared: ["react", "react-dom"],
      }),
    ],
    build: {
      modulePreload: false,
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
    },
  };
});
