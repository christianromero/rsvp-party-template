import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ── Paleta real basada en Gravity Park ────────────────────────────────────
      // Logo GP: azul royal #1B52E8, naranja #FF5200, contorno blanco
      // Tarjeta: fondo azul-cósmico oscuro, estrellas doradas, energía festiva
      colors: {
        gp: {
          // Azules del brand
          blue:       "#1B52E8", // azul Gravity Park (del logo/web)
          "blue-mid": "#1440C0", // azul más profundo
          "blue-dark":"#0A1535", // secciones oscuras
          "blue-bg":  "#060D22", // fondo principal (noche cósmica)
          "blue-card":"#0D1B3E", // tarjetas/glassmorphism

          // Naranjas (del logo)
          orange:     "#FF5200", // naranja signature GP
          "orange-2": "#FF7A00", // naranja más brillante
          amber:      "#FF9500", // ámbar calido

          // Dorados/amarillos (de las estrellas de la tarjeta)
          gold:       "#FFD700", // dorado estrella
          yellow:     "#FFE033", // amarillo brillante

          // Acentos adicionales
          pink:       "#FF0B7A", // magenta festivo
          cyan:       "#00C8FF", // celeste eléctrico
          green:      "#00FF88", // verde éxito
          purple:     "#6B2FE8", // violeta

          // Textos
          white:      "#FFFFFF",
          "text-dim": "#A0B0D0", // texto atenuado sobre azul
          muted:      "#5A6A8A", // texto secundario
        },
      },
      // ── Tipografías ──────────────────────────────────────────────────────────
      fontFamily: {
        fredoka: ["Fredoka", "cursive"],
        nunito:  ["Nunito", "sans-serif"],
      },
      // ── Animaciones personalizadas ───────────────────────────────────────────
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-14px)" },
        },
        floatAlt: {
          "0%, 100%": { transform: "translateY(0px) rotate(-2deg)" },
          "50%":       { transform: "translateY(-10px) rotate(2deg)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%":       { opacity: "1", transform: "scale(1.2)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(255,82,0,0.4), 0 0 40px rgba(255,82,0,0.2)" },
          "50%":       { boxShadow: "0 0 40px rgba(255,82,0,0.8), 0 0 80px rgba(255,82,0,0.3)" },
        },
        pulseGlowBlue: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(27,82,232,0.5), 0 0 40px rgba(27,82,232,0.2)" },
          "50%":       { boxShadow: "0 0 40px rgba(27,82,232,0.9), 0 0 80px rgba(27,82,232,0.4)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        orb: {
          "0%, 100%": { transform: "scale(1) translate(0, 0)", opacity: "0.6" },
          "33%":       { transform: "scale(1.3) translate(20px, -15px)", opacity: "0.8" },
          "66%":       { transform: "scale(0.8) translate(-15px, 10px)", opacity: "0.5" },
        },
        countBounce: {
          "0%":   { transform: "scale(1)" },
          "30%":  { transform: "scale(1.15)" },
          "60%":  { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        float:            "float 3.5s ease-in-out infinite",
        "float-slow":     "float 5s ease-in-out infinite",
        "float-alt":      "floatAlt 4s ease-in-out infinite",
        twinkle:          "twinkle 2s ease-in-out infinite",
        "pulse-glow":     "pulseGlow 2s ease-in-out infinite",
        "pulse-glow-blue":"pulseGlowBlue 2s ease-in-out infinite",
        shimmer:          "shimmer 2.5s linear infinite",
        "slide-up":       "slideUp 0.6s ease-out forwards",
        "scale-in":       "scaleIn 0.5s ease-out forwards",
        "fade-in":        "fadeIn 0.5s ease-out forwards",
        "spin-slow":      "spin 10s linear infinite",
        orb:              "orb 8s ease-in-out infinite",
        "count-bounce":   "countBounce 0.4s ease-out",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
