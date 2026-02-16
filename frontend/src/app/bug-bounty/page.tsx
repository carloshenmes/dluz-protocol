import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const severityLevels = [
  {
    level: "Crítica",
    color: "red",
    reward: "1.000 – 5.000 dLUZ",
    examples: [
      "Drain de fundos dos contratos ou pools",
      "Mint infinito de tokens (dLUZ, dCARBON, dENERGY)",
      "Bypass de controle de ownership / admin",
      "Manipulação de oráculos de preço",
    ],
  },
  {
    level: "Alta",
    color: "orange",
    reward: "500 – 1.000 dLUZ",
    examples: [
      "Bypass de permissões em funções protegidas",
      "Falha na lógica de swap que cause perda parcial",
      "Reentrancy explorável em contratos de pool",
      "Front-running com impacto financeiro direto",
    ],
  },
  {
    level: "Média",
    color: "yellow",
    reward: "100 – 500 dLUZ",
    examples: [
      "Denial of Service (DoS) em funções críticas",
      "Erros de cálculo em taxas ou slippage",
      "Falhas em validações de input",
      "Problemas de gas optimization que travem transações",
    ],
  },
  {
    level: "Baixa",
    color: "green",
    reward: "25 – 100 dLUZ",
    examples: [
      "Bugs visuais no frontend que afetem usabilidade",
      "Erros de exibição de saldo ou preço",
      "Links quebrados ou navegação inconsistente",
      "Melhorias de UX com impacto em segurança",
    ],
  },
];

const rules = [
  "Não explore vulnerabilidades em produção — use a testnet Base Sepolia.",
  "Reporte uma vulnerabilidade por submission. Não agrupe múltiplos bugs.",
  "Forneça passos claros de reprodução (PoC) com código quando possível.",
  "Dê ao time 90 dias para corrigir antes de qualquer disclosure pública.",
  "Não faça engenharia social, phishing ou ataques a infraestrutura.",
  "Não acesse ou modifique dados de outros usuários.",
  "Primeira submission válida tem prioridade — duplicatas não são recompensadas.",
  "Vulnerabilidades já conhecidas ou em componentes de terceiros estão fora do escopo.",
];

const inScope = [
  { name: "Smart Contracts", desc: "dLUZ, dCARBON, dENERGY tokens — Router, Factory e Pools da DEX" },
  { name: "Frontend", desc: "Aplicação Next.js — lógica de conexão de wallet, execução de swaps, exibição de dados on-chain" },
  { name: "Integrações", desc: "Interações com RainbowKit, wagmi, e contratos deployados na Base" },
];

const outOfScope = [
  "Infraestrutura do Vercel, GitHub ou provedores terceiros",
  "Ataques que exijam acesso físico ao dispositivo do usuário",
  "Vulnerabilidades em dependências sem impacto demonstrável",
  "Bugs já reportados ou listados em issues públicas",
  "Resultados de scanners automatizados sem PoC manual",
];

const colorMap: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  red: {
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    text: "text-red-400",
    dot: "bg-red-500",
  },
  orange: {
    border: "border-orange-500/30",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    dot: "bg-orange-500",
  },
  yellow: {
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    dot: "bg-yellow-500",
  },
  green: {
    border: "border-green-500/30",
    bg: "bg-green-500/10",
    text: "text-green-400",
    dot: "bg-green-500",
  },
};

export default function BugBountyPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Header />

      {/* Hero */}
      <section className="relative py-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-medium mb-6">
            <span>🛡️</span>
            <span>SEGURANÇA</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Bug Bounty{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              Program
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Ajude a proteger o dLuz Protocol. Encontre vulnerabilidades, reporte
            com responsabilidade e seja recompensado em dLUZ.
          </p>
        </div>
      </section>

      {/* Severity Levels */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">Níveis de Severidade & Recompensas</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            Recompensas pagas em dLUZ. O valor final depende da qualidade do report, impacto real e clareza do PoC.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {severityLevels.map((s) => {
              const c = colorMap[s.color];
              return (
                <div
                  key={s.level}
                  className={`rounded-xl border ${c.border} bg-gray-900/50 p-6 hover:bg-gray-900/80 transition-colors`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${c.dot}`} />
                      <h3 className={`text-lg font-bold ${c.text}`}>{s.level}</h3>
                    </div>
                    <span className={`text-sm font-mono px-3 py-1 rounded-full ${c.bg} ${c.text}`}>
                      {s.reward}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {s.examples.map((ex, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                        <span className="text-gray-600 mt-0.5">›</span>
                        {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Scope */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Escopo do Programa</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* In Scope */}
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                <span>✅</span> Em Escopo
              </h3>
              <div className="space-y-4">
                {inScope.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-lg border border-green-500/20 bg-green-500/5 p-4"
                  >
                    <h4 className="font-semibold text-white text-sm mb-1">{item.name}</h4>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Out of Scope */}
            <div>
              <h3 className="text-lg font-semibold text-gray-500 mb-4 flex items-center gap-2">
                <span>⛔</span> Fora do Escopo
              </h3>
              <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-5">
                <ul className="space-y-3">
                  {outOfScope.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                      <span className="text-gray-700 mt-0.5">✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">Regras de Participação</h2>
          <p className="text-gray-500 text-center mb-10">
            Responsible Disclosure — reporte com ética, seja recompensado com justiça.
          </p>

          <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-8">
            <ol className="space-y-4">
              {rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-800 text-green-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-400 pt-1">{rule}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* How to Report */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Como Reportar</h2>
          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            Envie seu report detalhado por um dos canais abaixo. Inclua sempre: descrição da vulnerabilidade, passos de reprodução e impacto estimado.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 hover:border-green-500/30 transition-colors">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="font-semibold text-white mb-2">Email</h3>
              <a
                href="mailto:security@dluzprotocol.com"
                className="text-sm text-green-400 hover:text-green-300 break-all"
              >
                security@dluzprotocol.com
              </a>
            </div>

            {/* GitHub */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 hover:border-green-500/30 transition-colors">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold text-white mb-2">GitHub</h3>
              <a
                href="https://github.com/carloshenmes/dluz-protocol/security/advisories/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-400 hover:text-green-300"
              >
                Security Advisory
              </a>
            </div>

            {/* Telegram */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 hover:border-green-500/30 transition-colors">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-semibold text-white mb-2">Telegram</h3>
              <a
                href="https://t.me/dluzprotocol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-400 hover:text-green-300"
              >
                @dluzprotocol
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-2xl border border-green-500/20 bg-gradient-to-b from-green-500/5 to-transparent p-12">
            <h2 className="text-2xl font-bold mb-4">Encontrou algo?</h2>
            <p className="text-gray-400 mb-8">
              Cada vulnerabilidade reportada fortalece o protocolo e protege a
              comunidade. Seu trabalho é valorizado.
            </p>
            <a
              href="mailto:security@dluzprotocol.com"
              className="inline-flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-400 text-gray-950 font-semibold rounded-xl transition-colors"
            >
              🛡️ Reportar Vulnerabilidade
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
