import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ThemeId = "neon" | "aurora" | "holo" | "mono";

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  tagline: string;
  swatch: string; // CSS gradient for the switcher preview
}

export const THEMES: ThemeMeta[] = [
  {
    id: "neon",
    label: "Neon Cyber",
    tagline: "Dark grid · glowing glass",
    swatch: "linear-gradient(120deg, #22d3ee, #818cf8 50%, #e879f9)",
  },
  {
    id: "aurora",
    label: "Aurora Glass",
    tagline: "Frosted glass · soft light",
    swatch: "linear-gradient(120deg, #7c5cff, #4f7bff 50%, #21b8c9)",
  },
  {
    id: "holo",
    label: "Holographic",
    tagline: "Iridescent mesh · kinetic",
    swatch: "linear-gradient(120deg, #ff5fd0, #b06bff 45%, #5fd0ff)",
  },
  {
    id: "mono",
    label: "Mono Futurism",
    tagline: "Monochrome · hairlines",
    swatch: "linear-gradient(120deg, #ffffff, #c7ccd4 60%, #6ee7b7)",
  },
];

export const THEME_IDS = THEMES.map((t) => t.id);
const STORAGE_KEY = "lyceum_theme";
export const DEFAULT_THEME: ThemeId = "neon";

export function readStoredTheme(): ThemeId {
  if (typeof localStorage === "undefined") return DEFAULT_THEME;
  const v = localStorage.getItem(STORAGE_KEY) as ThemeId | null;
  return v && THEME_IDS.includes(v) ? v : DEFAULT_THEME;
}

interface ThemeCtx {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
}
const Ctx = createContext<ThemeCtx>(null as unknown as ThemeCtx);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => readStoredTheme());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (t: ThemeId) => setThemeState(t);

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}
