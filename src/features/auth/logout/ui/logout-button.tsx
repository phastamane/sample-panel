import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Чистим токен
    queryClient.clear(); // Сбрасываем кэш запросов
    router.navigate({ to: "/login" }); // Уходим на авторизацию
  };

  return (
    <Button
      variant="outline"
      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
      onClick={handleLogout}
    >
      Выйти
    </Button>
  );
}
