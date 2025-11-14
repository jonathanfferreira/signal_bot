import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function TelegramSettings() {
  const [isLoading, setIsLoading] = useState(false);

  // Query para obter status do Telegram
  const { data: telegramStatus, refetch: refetchStatus } = trpc.telegram.getStatus.useQuery();

  // Mutation para enviar notificação de teste
  const sendTestMutation = trpc.telegram.sendTest.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Notificação enviada!', {
          description: data.message,
        });
      } else {
        toast.error('Erro ao enviar', {
          description: data.message,
        });
      }
      refetchStatus();
    },
    onError: (error) => {
      toast.error('Erro ao enviar notificação', {
        description: error.message,
      });
    },
  });

  const handleSendTest = async () => {
    setIsLoading(true);
    try {
      await sendTestMutation.mutateAsync();
    } finally {
      setIsLoading(false);
    }
  };

  if (!telegramStatus) {
    return null;
  }

  return (
    <Card className="bg-card border-border p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Notificações Telegram</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Receba sinais diretamente no seu celular
            </p>
          </div>
          <Badge variant={telegramStatus.configured ? 'default' : 'destructive'}>
            {telegramStatus.configured ? '✅ Conectado' : '❌ Desconectado'}
          </Badge>
        </div>

        {/* Status */}
        <div className="bg-background/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2">
            {telegramStatus.configured ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm font-medium text-foreground">
              {telegramStatus.configured
                ? 'Seu bot Telegram está configurado e pronto para enviar notificações'
                : 'Bot Telegram não está configurado. Verifique as variáveis de ambiente.'}
            </span>
          </div>

          {telegramStatus.configured && telegramStatus.chatId && (
            <div className="text-xs text-muted-foreground ml-7">
              Chat ID: {telegramStatus.chatId}
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <p className="text-sm text-foreground">
            <strong>Como funciona:</strong> Quando um novo sinal é gerado, você receberá uma notificação automática no Telegram com os detalhes do sinal (ativo, direção, força e indicadores).
          </p>
        </div>

        {/* Botão de teste */}
        <Button
          onClick={handleSendTest}
          disabled={!telegramStatus.configured || isLoading}
          className="w-full"
          variant={telegramStatus.configured ? 'default' : 'outline'}
        >
          <Send className="w-4 h-4 mr-2" />
          {isLoading ? 'Enviando...' : 'Enviar Notificação de Teste'}
        </Button>

        {!telegramStatus.configured && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-xs text-foreground">
              Para configurar o Telegram, você precisa fornecer o Bot Token e seu Chat ID através das variáveis de ambiente.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
