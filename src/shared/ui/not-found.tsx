import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">404</h1>
        <p className="text-muted-foreground">
          Кажется, такой страницы не существует или она была удалена.
        </p>
      </div>
      <Link to="/">
        <Button>Вернуться на дашборд</Button>
      </Link>
    </div>
  );
}
