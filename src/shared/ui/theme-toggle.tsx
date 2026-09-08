import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleTheme } from "@/shared/lib/theme";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  const handleToggle = () => {
    toggleTheme();
    setIsDark(document.documentElement.classList.contains("dark"));
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className="w-full justify-start gap-2"
    >
      {isDark ? <Sun /> : <Moon />}
      {isDark ? "Светлая тема" : "Тёмная тема"}
    </Button>
  );
}
