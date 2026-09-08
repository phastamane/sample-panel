import { LogoutButton } from "@/features/auth/logout/ui/logout-button";
import { ENTITY_NAVIGATION } from "@/shared/config/navigation";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { Link } from "@tanstack/react-router";

function Sidebar() {
  return (
    <aside className="flex w-64 flex-col border-r bg-background px-4 py-6">
      <div className="mb-8 px-2 text-xl font-bold tracking-tight">
        CyberLiga Admin
      </div>

      {/* Динамическая навигация из конфига */}
      <nav className="flex-1 space-y-1">
        {ENTITY_NAVIGATION.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground [&.active]:bg-primary/10 [&.active]:text-primary"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-2 border-t pt-4">
        <ThemeToggle />
        <LogoutButton />
      </div>
    </aside>
  );
}

export default Sidebar;
