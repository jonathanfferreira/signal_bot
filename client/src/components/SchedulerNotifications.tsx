import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Bell, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduledSignal {
  symbol: string;
  direction: 'CALL' | 'PUT';
  strength: number;
  timestamp: Date;
  details: {
    ema: string;
    rsi: string;
    bbands: string;
    macd: string;
  };
}

export default function SchedulerNotifications() {
  const [schedulerStatus, setSchedulerStatus] = useState<any>(null);
  const [lastNotifiedSignals, setLastNotifiedSignals] = useState<Set<string>>(new Set());

  // Query para obter status do scheduler
  const { data: status } = trpc.scheduler.getStatus.useQuery(undefined, {
    refetchInterval: 10000, // Atualizar a cada 10 segundos
  });

  // Query para obter últimos sinais
  const { data: lastSignals } = trpc.scheduler.getLastSignals.useQuery(undefined, {
    refetchInterval: 10000, // Atualizar a cada 10 segundos
  });

  useEffect(() => {
    if (status) {
      setSchedulerStatus(status);
    }
  }, [status]);

  // Notificar quando novos sinais forem gerados
  useEffect(() => {
    if (lastSignals && lastSignals.length > 0) {
      lastSignals.forEach((signal: ScheduledSignal) => {
        const signalKey = `${signal.symbol}-${signal.direction}-${signal.strength}`;

        if (!lastNotifiedSignals.has(signalKey)) {
          // Mostrar notificação
          const title = `🚀 Novo Sinal: ${signal.symbol}`;
          const description = `${signal.direction} - Força: ${signal.strength}/4`;

          if (signal.direction === 'CALL') {
            toast.success(title, { description });
          } else {
            toast.error(title, { description });
          }

          // Tentar usar Notification API do navegador se disponível
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
              body: description,
              icon: signal.direction === 'CALL' ? '📈' : '📉',
            });
          }

          // Marcar como notificado
          setLastNotifiedSignals(prev => {
            const newSet = new Set(prev);
            newSet.add(signalKey);
            return newSet;
          });
        }
      });
    }
  }, [lastSignals, lastNotifiedSignals]);

  if (!status) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-h-96 overflow-y-auto z-50">
      {/* Card de Status do Scheduler */}
      <Card className="bg-card border-border mb-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Análise Automática</h3>
          </div>
          <Badge variant={status.isRunning ? 'default' : 'outline'}>
            {status.isRunning ? '🟢 Ativa' : '🔴 Inativa'}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>Ativos monitorados: <span className="font-semibold text-foreground">{status.totalAssets}</span></p>
          <p>Próxima análise: em até 5 minutos</p>
        </div>
      </Card>

      {/* Últimos Sinais */}
      {lastSignals && lastSignals.length > 0 && (
        <Card className="bg-card border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Últimos Sinais</h3>
          </div>

          <div className="space-y-2">
            {lastSignals.slice(0, 5).map((signal: ScheduledSignal, idx: number) => (
              <div
                key={idx}
                className={`p-2 rounded-lg flex items-center justify-between ${
                  signal.direction === 'CALL'
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  {signal.direction === 'CALL' ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-sm font-medium text-foreground">
                    {signal.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={signal.direction === 'CALL' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {signal.direction}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {signal.strength}/4
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
