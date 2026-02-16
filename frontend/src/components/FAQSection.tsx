"use client";

import { AnimateOnScroll } from "./AnimateOnScroll";
import { useState } from "react";

const faqs = [
  {
    q: "O que é um crédito de carbono?",
    a: "Um crédito de carbono representa 1 tonelada de CO₂ equivalente que foi evitada ou removida da atmosfera. É verificado por entidades como Verra ou Gold Standard e pode ser negociado no mercado voluntário ou regulado.",
  },
  {
    q: "Como o dLuz Protocol tokeniza créditos?",
    a: "Projetos verificados registram seus créditos no smart contract. Cada crédito gera 1 token dCARBON (ERC-20) na rede Base. O token é rastreável, imutável e pode ser negociado na DEX ou queimado para compensar emissões.",
  },
  {
    q: "O que é o SBCE?",
    a: "O Sistema Brasileiro de Comércio de Emissões (SBCE) foi criado pela Lei 15.042/2024. Opera no modelo cap-and-trade: empresas que emitem acima de 10 mil tCO₂e/ano recebem cotas de emissão (CBEs) e podem negociá-las. O dLuz é compatível com CBEs e CRVEs tokenizados.",
  },
  {
    q: "Qual a diferença entre dCARBON e dENERGY?",
    a: "dCARBON representa créditos de carbono (1 token = 1 tCO₂ compensada). dENERGY representa Certificados de Energia Renovável — RECs (1 token = 1 MWh de energia limpa gerada). Ambos são negociáveis na DEX.",
  },
  {
    q: "Preciso de KYC para usar o protocolo?",
    a: "Não. O dLuz Protocol é descentralizado e permissionless. Basta conectar sua wallet (MetaMask, Coinbase Wallet, etc.) para negociar tokens. Para registrar novos projetos, há um processo de verificação off-chain.",
  },
  {
    q: "Como funciona o Burn-to-Retire?",
    a: "Ao queimar tokens dCARBON, um certificado NFT de offsetting é gerado automaticamente on-chain. Esse certificado é a prova imutável de que aquela tonelada de CO₂ foi permanentemente compensada.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border rounded-xl cursor-pointer transition-all duration-300 ${
        open
          ? "border-green-500/40 bg-green-500/5 shadow-[0_0_16px_rgba(34,197,94,0.08)]"
          : "border-gray-800 bg-gray-900/40 hover:border-gray-700 hover:bg-gray-900/60"
      }`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between p-5">
        <h3 className="text-sm font-semibold text-white pr-4">{q}</h3>
        <span
          className={`text-green-400 text-xl transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </div>

      <div className="faq-answer" data-open={open}>
        <div className="faq-answer-inner">
          <div className="px-5 pb-5 -mt-1">
            <p className="text-sm text-gray-400 leading-relaxed">{a}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="py-24 px-6 border-t border-gray-800/50">
      <div className="max-w-3xl mx-auto">
        <AnimateOnScroll>
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-widest mb-4 block">
              ❓ Dúvidas Frequentes
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              FAQ
            </h2>
            <p className="text-gray-400">
              As perguntas mais comuns sobre o protocolo, tokens e mercado de carbono.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <AnimateOnScroll key={faq.q} delay={i * 0.08}>
              <FAQItem q={faq.q} a={faq.a} />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
