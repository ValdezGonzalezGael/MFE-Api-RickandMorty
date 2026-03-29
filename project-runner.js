// project-runner.js
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const readline = require("readline");

// Utilidad para preguntar en consola con promesas
function createQuestionInterface() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (text) =>
    new Promise((resolve) => rl.question(text, resolve));

  return { rl, question };
}

// Ejecuta un comando en la misma consola (fallback para no-Windows)
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      ...options,
    });

    child.on("error", (err) => {
      console.error(`Error al ejecutar ${command}:`, err.message);
      reject(err);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(`El comando "${command} ${args.join(" ")}" salió con código ${code}`)
        );
      }
    });
  });
}

async function showMenu(baseDir, directories, question) {
  const exitOption = directories.length + 1;

  while (true) {
    console.log("\n🔎 Proyectos encontrados:\n");
    directories.forEach((dir, index) => {
      console.log(`  ${index + 1}. ${dir}`);
    });
    console.log("  0. 🚀 TODOS los proyectos (una pestaña por proyecto en Windows Terminal)");
    console.log(`  ${exitOption}. ❌ Salir`);
    console.log("");

    const answer = await question(
      "👉 Escribe el número del proyecto que quieres ejecutar (o 0 para TODOS, o salir): "
    );
    const selectedNumber = parseInt(answer, 10);

    if (isNaN(selectedNumber)) {
      console.error("❌ Opción no válida (no es un número).");
      continue;
    }

    // Salir
    if (selectedNumber === exitOption) {
      console.log("\n👋 Saliendo del programa. ¡Hasta luego!\n");
      break;
    }

    // ============================
    // OPCIÓN 0: TODOS LOS PROYECTOS
    // ============================
    if (selectedNumber === 0) {
      if (process.platform !== "win32") {
        console.error(
          "❌ La opción de pestañas múltiples solo está preparada para Windows (Windows Terminal: wt)."
        );
        continue;
      }

      const validProjects = [];

      console.log("\n🧾 Preparando pestañas para TODOS los proyectos...\n");

      for (const projectName of directories) {
        const projectPath = path.join(baseDir, projectName);
        const packageJsonPath = path.join(projectPath, "package.json");

        if (!fs.existsSync(packageJsonPath)) {
          console.warn(
            `⚠️ "${projectName}" no tiene package.json. Se omite para la ejecución.\n`
          );
          continue;
        }

        let pkg;
        try {
          const raw = fs.readFileSync(packageJsonPath, "utf8");
          pkg = JSON.parse(raw);
        } catch (err) {
          console.warn(
            `⚠️ No se pudo leer/parsear package.json de "${projectName}": ${err.message}\n`
          );
          continue;
        }

        const scripts = pkg.scripts || {};
        if (!scripts["build:dev"] || !scripts["preview:dev"]) {
          console.warn(
            `⚠️ "${projectName}" no tiene ambos scripts "build:dev" y "preview:dev". Se omite.\n`
          );
          continue;
        }

        validProjects.push({ projectName, projectPath });
      }

      if (validProjects.length === 0) {
        console.error(
          "❌ Ningún proyecto tiene package.json con scripts build:dev y preview:dev. No hay nada que lanzar."
        );
        continue; // volvemos al menú
      }

      const wtArgs = [];
      // -w 0: intenta reutilizar ventana 0, si no existe crea una nueva
      wtArgs.push("-w", "0");

      for (let i = 0; i < validProjects.length; i++) {
        const { projectName, projectPath } = validProjects[i];
        const tabCommand = `cd /d "${projectPath}" && npm run build:dev && npm run preview:dev`;

        // 🔑 IMPORTANTE: cada comando "nt ..." va SEPARADO por un ";" para que wt sepa dónde termina
        wtArgs.push(
          "nt",
          "--title",
          projectName,
          "cmd",
          "/k",
          tabCommand
        );

        // Agregamos ';' como separador entre comandos de wt
        if (i < validProjects.length - 1) {
          wtArgs.push(";");
        }
      }

      console.log("🪟 Abriendo Windows Terminal con una pestaña por proyecto...\n");
      // Puedes poner shell: true si tu entorno lo requiere, pero normalmente no hace falta
      spawn("wt", wtArgs, {
        detached: true,
        stdio: "ignore",
      });

      console.log("✅ Listo. Se abrió Windows Terminal con varias pestañas.");
      console.log("   En cada pestaña se ejecutará: npm run build:dev && npm run preview:dev");
      console.log("   Para detener cada servidor, usa Ctrl + C en la pestaña correspondiente.\n");

      continue; // volvemos al menú
    }

    // ============================
    // OPCIÓN: UN PROYECTO ESPECÍFICO
    // ============================
    if (selectedNumber < 1 || selectedNumber > directories.length) {
      console.error("❌ Opción fuera de rango.");
      continue;
    }

    const index = selectedNumber - 1;
    const projectName = directories[index];
    const projectPath = path.join(baseDir, projectName);

    console.log(`\n📂 Proyecto seleccionado: ${projectName}`);
    console.log(`📂 Ruta del proyecto: ${projectPath}\n`);

    const packageJsonPath = path.join(projectPath, "package.json");
    if (!fs.existsSync(packageJsonPath)) {
      console.error("❌ Este proyecto no tiene package.json, no parece ser un proyecto npm.");
      continue;
    }

    let packageJson;
    try {
      packageJson = JSON.parse(
        fs.readFileSync(packageJsonPath, "utf8")
      );
    } catch (err) {
      console.error(
        `❌ No se pudo leer/parsear package.json de "${projectName}": ${err.message}`
      );
      continue;
    }

    const scripts = packageJson.scripts || {};
    if (!scripts["build:dev"] || !scripts["preview:dev"]) {
      console.warn(
        '⚠️ Este proyecto no tiene ambos scripts "build:dev" y "preview:dev". Se intentará ejecutar igual.'
      );
    }

    if (process.platform === "win32") {
      const tabCommand = `cd /d "${projectPath}" && npm run build:dev && npm run preview:dev`;

      const wtArgs = [
        "-w",
        "0",
        "nt",
        "--title",
        projectName,
        "cmd",
        "/k",
        tabCommand,
      ];

      console.log("🪟 Abriendo Windows Terminal en una nueva pestaña para este proyecto...\n");

      spawn("wt", wtArgs, {
        detached: true,
        stdio: "ignore",
      });

      console.log(
        `✅ Listo. Se abrió una pestaña en Windows Terminal con el proyecto "${projectName}".`
      );
      console.log('   Comandos ejecutados: npm run build:dev && npm run preview:dev');
      console.log("   Para detener el servidor, usa Ctrl + C en esa pestaña.\n");

      continue; // volvemos al menú
    }

    // Fallback para sistemas no Windows: ejecuta en la misma consola
    try {
      console.log("🏗  Ejecutando: npm run build:dev\n");
      await runCommand("npm", ["run", "build:dev"], { cwd: projectPath });
      console.log("\n✅ build:dev terminado correctamente.\n");

      console.log("🚀 Levantando preview:dev: npm run preview:dev\n");
      console.log("ℹ️ El servidor se quedará corriendo aquí. Para detenerlo, usa Ctrl + C.\n");
      await runCommand("npm", ["run", "preview:dev:dev"], { cwd: projectPath });
    } catch (err) {
      console.error(`❌ Error al ejecutar comandos en "${projectName}": ${err.message}`);
    }

    // Después de terminar, regresamos al menú
  }
}

async function main() {
  const { rl, question } = createQuestionInterface();

  try {
    const baseDir =
      process.argv[2] && process.argv[2].trim() !== ""
        ? path.resolve(process.argv[2])
        : process.cwd();

    console.log(`\n📁 Carpeta base: ${baseDir}\n`);

    if (!fs.existsSync(baseDir)) {
      console.error("❌ La carpeta base no existe.");
      process.exit(1);
    }

    const entries = await fs.promises.readdir(baseDir, { withFileTypes: true });
    const directories = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    if (directories.length === 0) {
      console.log("⚠️ No se encontraron subcarpetas en la ruta indicada.");
      process.exit(0);
    }

    await showMenu(baseDir, directories, question);
  } catch (err) {
    console.error("\n❌ Ocurrió un error inesperado:", err.message);
  } finally {
    // cerramos el readline cuando ya no se use el menú
    // (si sales con la opción "Salir")
  }
}

main();
