import { publicProcedure, router } from "../_core/trpc";
import { sendTestNotification, getTelegramStatus } from "../telegram";

export const telegramRouter = router({
  // Obter status da configuração do Telegram
  getStatus: publicProcedure.query(() => {
    return getTelegramStatus();
  }),

  // Enviar notificação de teste
  sendTest: publicProcedure.mutation(async () => {
    const success = await sendTestNotification();
    return {
      success,
      message: success
        ? "Notificação de teste enviada! Verifique seu Telegram."
        : "Erro ao enviar notificação. Verifique se o bot token e chat ID estão configurados.",
    };
  }),
});
