import { useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function GlobalError({ error }: { error: Error }) {
  const router = useRouter();

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
          Упс! Что-то сломалось
        </h1>
        <p className="text-muted-foreground">
          Произошла непредвиденная ошибка на стороне клиента.
        </p>
      </div>

      {/* Выводим текст ошибки для дебага (можно скрыть на проде) */}
      <div className="max-w-xl rounded-md bg-destructive/10 p-4 text-sm text-destructive overflow-auto">
        <code>{error.message}</code>
      </div>

      <div className="flex gap-4">
        <Button onClick={() => window.location.reload()} variant="default">
          Обновить страницу
        </Button>
        <Button onClick={() => router.navigate({ to: "/" })} variant="outline">
          На главную
        </Button>
      </div>
    </div>
  );
}
