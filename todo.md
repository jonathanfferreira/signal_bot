# TODO - Bot de Sinais Financeiros

## Funcionalidades Principais

### Backend
- [x] Configurar schema do banco de dados para sinais, ativos e histórico
- [x] Implementar lógica de análise de indicadores técnicos (EMA, RSI, BBANDS, MACD)
- [x] Criar endpoint para buscar dados de ativos usando yfinance
- [x] Criar endpoint para análise de sinais em tempo real
- [x] Criar endpoint para histórico de sinais gerados
- [ ] Implementar sistema de notificações (Telegram opcional)
- [ ] Criar job automático para análise periódica (a cada 5 minutos)

### Frontend
- [x] Design sofisticado e tecnológico com tema dark
- [x] Dashboard principal com visualização de sinais ativos
- [x] Painel de seleção de ativos para monitoramento
- [ ] Visualização de gráficos com indicadores técnicos
- [x] Histórico de sinais gerados com filtros
- [ ] Painel de configurações (intervalo de análise, ativos monitorados)
- [ ] Sistema de notificações em tempo real
- [x] Responsividade completa para mobile e desktop
- [x] Animações e transições suaves

### Integrações
- [x] Integração com API de dados financeiros (yfinance via backend)
- [x] Sistema de autenticação para usuários
- [x] Armazenamento de preferências do usuário

## Melhorias Futuras
- [ ] Backtesting de estratégias
- [ ] Alertas customizáveis por usuário
- [ ] Exportação de relatórios
- [ ] Integração com múltiplas corretoras


## Novas Funcionalidades (v1.1)

- [x] Criar repositório GitHub
- [x] Fazer push do código para GitHub
- [x] Ajustar lógica de sinais para gerar sinais fracos (2 pontos)
- [x] Ajustar lógica de sinais para gerar sinais médios (2-3 pontos)
- [x] Criar filtros de força de sinal no frontend
- [x] Testar geração de sinais com diferentes níveis
- [x] Corrigir erro de toString() em valores undefined


## Análise Automática (v1.2)

- [x] Instalar node-cron
- [x] Criar módulo de análise automática
- [x] Implementar job que roda a cada 5 minutos
- [x] Criar sistema de notificações para novos sinais
- [x] Integrar notificações no frontend
- [x] Testar análise automática


## Integração Telegram (v1.3)

- [x] Configurar bot token do Telegram como secret
- [x] Criar módulo de integração com Telegram
- [x] Implementar notificações via Telegram no scheduler
- [x] Adicionar painel de configuração do Telegram
- [x] Testar notificações no celular
