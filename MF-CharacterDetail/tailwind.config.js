const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Incluye todos los archivos del proyecto donde podría usarse Tailwind
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}", // Para que funcione con NextUI
  ],
  theme: {
    extend: {
      screens: {
        sm: "480px", // Pantallas pequeñas, como móviles
        md: "768px", // Pantallas medianas, como tablets
        lg: "1024px", // Escritorios pequeños o laptops con baja resolución
        xl: "1280px", // Escritorios medianos o laptops con escalado al 150%
        "2xl": "1536px", // Escritorios grandes
        "4xl": "1920px", // Pantallas full HD sin escalado
      },
      colors: {
        primary: "#EAB308", // Color principal, usado para elementos destacados
        textTitle: "#262626", // Color para los títulos
        textSubtitle: "#6B6B6B", // Color para los subtítulos o texto secundario
        iconDisabled: "#BEBEBE", // Iconos deshabilitados
        success: "#4EA93B", // Colores para estados exitosos
        rejected: "#FF7171", // Colores para estados rechazados
        edit: "#5CBBFF", // Colores para acciones de edición
        background: "#EDF0FA", // Color de fondo claro
        darkbg: "#24262D", // Fondo oscuro para modo oscuro
        darkcomponent: "#18181B", // Fondo oscuro para componentes específicos
        componentbg: "#F9FAFB", // Fondo claro para componentes específicos
      },
    },
  },
  darkMode: "class", // Usa la clase "dark" para habilitar el modo oscuro
  plugins: [nextui()], // Carga el plugin de NextUI
};
