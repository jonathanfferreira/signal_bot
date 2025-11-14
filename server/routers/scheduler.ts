import { publicProcedure, router } from "../_core/trpc";
import { getLastSignals, getSchedulerStatus } from "../scheduler";

export const schedulerRouter = router({
  // Obter status do scheduler
  getStatus: publicProcedure.query(() => {
    return getSchedulerStatus();
  }),

  // Obter últimos sinais gerados pelo scheduler
  getLastSignals: publicProcedure.query(() => {
    return getLastSignals();
  }),
});
