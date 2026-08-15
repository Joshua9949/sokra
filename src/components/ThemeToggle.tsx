import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="fixed bottom-5 right-5 z-50 h-11 w-11 rounded-full border border-border2 bg-surface/80 backdrop-blur-md flex items-center justify-center text-text2 hover:text-text hover:border-primary transition-all duration-200"
    >
      {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
