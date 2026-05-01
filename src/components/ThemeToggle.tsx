"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isLight = theme === "light";

  return (
    <button
      onClick={() => setTheme(isLight ? "dark" : "light")}
      className="p-2 rounded-full hover:bg-accent transition-colors"
      aria-label="Toggle theme"
    >
      {isLight ? (
        <Moon className="w-5 h-5 text-muted-foreground hover:text-foreground" />
      ) : (
        <Sun className="w-5 h-5 text-muted-foreground hover:text-foreground" />
      )}
    </button>
  );
}