import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, Zap, Shield, BarChart3, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="container relative z-10 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Análise Técnica Avançada</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Bot de Sinais
              <span className="block text-primary mt-2">Financeiros</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Análise em tempo real de ativos financeiros com confluência de indicadores técnicos. 
              Tome decisões mais informadas com sinais baseados em EMA, RSI, BBANDS e MACD.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Activity className="w-5 h-5 mr-2" />
                  Acessar Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Recursos Principais
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tecnologia de ponta para análise de mercado financeiro
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-card border-border hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Sinais em Tempo Real</CardTitle>
              <CardDescription>
                Análise instantânea de ativos com sinais de CALL e PUT baseados em confluência de indicadores
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>4 Indicadores Técnicos</CardTitle>
              <CardDescription>
                EMA (9/21), RSI (14), Bandas de Bollinger e MACD trabalhando em conjunto para maior precisão
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Filtro de Tendência</CardTitle>
              <CardDescription>
                Validação com tendência de longo prazo (EMA 50 em 1h) para reduzir sinais falsos
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Múltiplos Ativos</CardTitle>
              <CardDescription>
                Suporte para Forex (EUR/USD, GBP/USD, etc.) e Criptomoedas (BTC, ETH, etc.)
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Histórico Completo</CardTitle>
              <CardDescription>
                Acesse o histórico de todos os sinais gerados com detalhes dos indicadores
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-card border-border hover:border-primary/50 transition-all">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Interface Moderna</CardTitle>
              <CardDescription>
                Design responsivo e tecnológico para uma experiência de uso superior
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="bg-secondary/30 py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Como Funciona
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sistema de confluência para sinais mais confiáveis
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">Coleta de Dados</h3>
                    <p className="text-muted-foreground">
                      O sistema busca dados históricos do ativo em intervalos de 5 minutos e 1 hora
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">Cálculo de Indicadores</h3>
                    <p className="text-muted-foreground">
                      Cada indicador (EMA, RSI, BBANDS, MACD) é calculado e gera um voto para CALL ou PUT
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">Confluência</h3>
                    <p className="text-muted-foreground">
                      Um sinal só é gerado se pelo menos 3 dos 4 indicadores concordarem na mesma direção
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">Validação de Tendência</h3>
                    <p className="text-muted-foreground">
                      O sinal é validado contra a tendência de longo prazo (EMA 50 em 1h) para maior confiabilidade
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container py-20">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Pronto para começar?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Acesse o dashboard e comece a analisar ativos financeiros agora mesmo
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Activity className="w-5 h-5 mr-2" />
                Ir para Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container text-center text-muted-foreground">
          <p>Bot de Sinais Financeiros - Análise Técnica Avançada</p>
          <p className="text-sm mt-2">
            ⚠️ Aviso: Este sistema é apenas para fins educacionais. Sempre opere com gerenciamento de risco.
          </p>
        </div>
      </footer>
    </div>
  );
}
