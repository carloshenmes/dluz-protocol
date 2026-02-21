# dLuz Protocol — Whitepaper v1.0

> Tokenização de créditos de carbono e certificados de energia renovável na Base (Ethereum L2).

---

## Sumário

1. [Resumo](#1-resumo)
2. [O Problema](#2-o-problema)
3. [A Solução](#3-a-solução)
4. [Arquitetura do Protocolo](#4-arquitetura-do-protocolo)
5. [Tokens](#5-tokens)
6. [Mecânicas Principais](#6-mecânicas-principais)
7. [Tokenomics](#7-tokenomics)
8. [Roadmap de Governança](#8-roadmap-de-governança)
9. [Modelo de Receita](#9-modelo-de-receita)
10. [Segurança](#10-segurança)
11. [Roadmap](#11-roadmap)
12. [Aviso Legal](#12-aviso-legal)

---

## 1. Resumo

dLuz é um protocolo DeFi construído na **Base** (Ethereum L2) que conecta o mercado voluntário de carbono e certificados de energia renovável (RECs) à blockchain. Permite emissão, negociação, aposentadoria e verificação transparente de ativos ambientais através de três tokens ERC-20 interconectados: **DLUZ**, **dCARBON** e **dENERGY**.

O protocolo elimina intermediários, reduz fraudes através da rastreabilidade on-chain e cria incentivos econômicos para compensação de carbono via mecanismo de burn-to-earn.

---

## 2. O Problema

O mercado voluntário de créditos de carbono deve atingir **US$ 50 bilhões até 2030** (McKinsey, 2023). Ainda assim, sofre com:

- **Dupla contagem** — o mesmo crédito vendido múltiplas vezes em diferentes registros.
- **Opacidade** — compradores não conseguem verificar independentemente a origem ou aposentadoria do crédito.
- **Taxas altas** — corretores e intermediários capturam 15-30% do valor.
- **Fragmentação** — RECs e créditos de carbono vivem em sistemas desconectados.
- **Sem composabilidade** — créditos não interagem com primitivos DeFi (empréstimo, LP, staking).

---

## 3. A Solução

dLuz unifica créditos de carbono e RECs em um único protocolo on-chain com:

| Recurso | Mecanismo |
|---|---|
| **Anti-dupla contagem** | Cada crédito é uma tx de mint única na Base. Burn = aposentadoria permanente. |
| **Transparência total** | Todos os mints, transferências e aposentadorias são públicos on-chain. |
| **Taxas baixas** | 2% taxa de aposentadoria + 0.3% taxa de swap vs. 15-30% tradicional. |
| **Sistema unificado** | dCARBON (carbono) e dENERGY (RECs) em um protocolo. |
| **Composabilidade DeFi** | Tokens funcionam com qualquer protocolo compatível com ERC-20. |

---

## 4. Arquitetura do Protocolo

┌─────────────────────────────────────────────────────┐ │ dLuz Protocol │ ├──────────┬──────────┬──────────┬────────────────────┤ │ DLuzToken│DCarbonTkn│DEnergyTkn│ CarbonRegistry │ │ (ERC-20) │ (ERC-20) │ (ERC-20) │ (Lógica Core) │ │Governança│ Créditos │ RECs │ Retire / Mint │ │+ Utilidad│ Carbono │ │ Rates / Treasury │ ├──────────┴──────────┴──────────┴────────────────────┤ │ Base (Ethereum L2) │ ├─────────────────────────────────────────────────────┤ │ Ethereum L1 (Settlement) │ └─────────────────────────────────────────────────────┘




### Smart Contracts

| Contrato | Função | Padrão |
|---|---|---|
| `DLuzToken` | Governança + utilidade + recompensas | ERC-20, ERC-20Permit, Ownable |
| `DCarbonToken` | Créditos de carbono tokenizados | ERC-20, AccessControl (MINTER_ROLE) |
| `DEnergyToken` | RECs tokenizados | ERC-20, AccessControl (MINTER_ROLE) |
| `CarbonRegistry` | Lógica de aposentadoria, gestão de taxas, log de eventos | Ownable, Pausable |

Todos os contratos utilizam bibliotecas auditadas **OpenZeppelin v5**. Compilados com Solidity 0.8.28, target EVM Paris.

---

## 5. Tokens

### 5.1 DLUZ — Governança & Utilidade

| Propriedade | Valor |
|---|---|
| Nome | dLuz Token |
| Símbolo | DLUZ |
| Supply Máximo | 100.000.000 (100M) |
| Mint Inicial | 10.000.000 (10M) para o deployer |
| Mintável | Sim, pelo owner, até o supply máximo |
| Queimável | Sim, por qualquer holder |
| Permit | ERC-2612 (aprovações gasless) |

**Casos de uso:**
- Recompensas de aposentadoria (queimar dCARBON → ganhar DLUZ)
- Provisão de liquidez na DEX
- Recompensas de farming
- Votação de governança futura

### 5.2 dCARBON — Créditos de Carbono

| Propriedade | Valor |
|---|---|
| Nome | dCarbon Token |
| Símbolo | dCARBON |
| Supply Máximo | Sem limite (mint sob demanda) |
| Mintável | Apenas MINTER_ROLE |
| Queimável | Pelo holder (aposentar) ou via CarbonRegistry |
| Paridade | 1 dCARBON = 1 tCO₂e compensada |

**Ciclo de vida:**
1. Projeto verificado submete créditos à dLuz Foundation
2. Foundation valida contra registro (Verra, Gold Standard)
3. MINTER_ROLE faz mint de dCARBON 1:1
4. Usuário negocia, mantém ou aposenta (queima)
5. Queima é permanente e irreversível

### 5.3 dENERGY — Certificados de Energia Renovável

| Propriedade | Valor |
|---|---|
| Nome | dEnergy Token |
| Símbolo | dENERGY |
| Supply Máximo | Sem limite (mint sob demanda) |
| Mintável | Apenas MINTER_ROLE |
| Queimável | Pelo holder (resgate) |
| Paridade | 1 dENERGY = 1 MWh de energia renovável gerada |

**Geração:**
- Mintado automaticamente quando dCARBON é aposentado via CarbonRegistry
- Taxa configurável pelo owner (padrão: 1:1)

---

## 6. Mecânicas Principais

### 6.1 Fluxo de Aposentadoria (Retire)

Usuário chama CarbonRegistry.retire(amount, reason) │ ├─► Valida: amount > 0, reason não vazio, saldo suficiente │ ├─► Queima dCARBON do chamador │ ├─► Minta dENERGY para o chamador (amount × energyRate / 1e18) │ └─► Ignorado se energyRate = 0 ou resultado trunca para 0 │ ├─► Transfere DLUZ do Treasury para o chamador (amount × dluzRewardRate / 1e18) │ └─► Ignorado se dluzRewardRate = 0 ou resultado trunca para 0 │ ├─► Registra aposentadoria on-chain (quem, quanto, razão, timestamp) │ ├─► Emite: CarbonRetired, EnergyMinted, DluzRewarded │ └─► ID de aposentadoria atribuído (sequencial, por usuário)




### 6.2 Taxas Padrão

| Taxa | Padrão | Significado |
|---|---|---|
| `energyRate` | 1e18 (1:1) | 1 dCARBON aposentado → 1 dENERGY mintado |
| `dluzRewardRate` | 10e18 (10:1) | 1 dCARBON aposentado → 10 DLUZ de recompensa |

### 6.3 Limites de Segurança

| Parâmetro | Valor Máximo |
|---|---|
| `energyRate` | 100e18 (100:1) |
| `dluzRewardRate` | 1000e18 (1000:1) |
| `tamanho do reason` | 280 caracteres |

### 6.4 Paginação

Aposentadorias são consultáveis via `getRetirements(user, offset, limit)` para paginação eficiente no frontend.

---

## 7. Tokenomics

### 7.1 Distribuição DLUZ

| Alocação | Quantidade | % | Vesting |
|---|---|---|---|
| Treasury (Recompensas retire + incentivos LP) | 40.000.000 | 40% | Liberação programática |
| Time & Fundadores | 15.000.000 | 15% | Cliff de 12 meses, linear por 36 meses |
| Ecossistema & Parcerias | 20.000.000 | 20% | Baseado em milestones |
| Comunidade (Farming, Airdrops) | 15.000.000 | 15% | Cronograma de halving |
| Liquidez (Pools DEX) | 10.000.000 | 10% | No lançamento |

### 7.2 Pressão Deflacionária

DLUZ tem hard cap de 100M. O supply diminui ao longo do tempo através de:

1. **Burn da taxa de retire** — 2% de cada aposentadoria de dCARBON é direcionado ao Treasury, convertido em DLUZ e queimado.
2. **Burn voluntário** — qualquer holder pode queimar DLUZ a qualquer momento.
3. **Halving de recompensa** — dluzRewardRate diminui conforme a adoção cresce, reduzindo emissão.

### 7.3 Supply de dCARBON & dENERGY

Ambos são **orientados por demanda**. Sem limite, sem pré-mineração.

- dCARBON: mintado apenas quando créditos do mundo real são verificados e registrados.
- dENERGY: mintado apenas como output de eventos de aposentadoria.

Isso garante que os tokens são sempre lastreados por ativos ambientais verificados.

---

## 8. Roadmap de Governança

### Fase 1 — Foundation (Atual)

- **Modelo:** Multisig centralizado (3 de 5)
- **Quem:** Time core da dLuz Foundation
- **Poderes:** Mint de dCARBON, definir taxas, pausar contratos, gerenciar treasury
- **Período:** Lançamento → Mês 6

### Fase 2 — Conselho

- **Modelo:** Semi-descentralizado
- **Quem:** Verificadores credenciados (Verra, Gold Standard, registros locais) + Foundation
- **Poderes:** Verificadores podem mintar dCARBON independentemente via integração com oracle
- **Governança:** Holders de DLUZ votam na inclusão/remoção de verificadores
- **Período:** Mês 6 → Mês 12

### Fase 3 — DAO

- **Modelo:** Totalmente descentralizado
- **Quem:** Holders do token DLUZ
- **Poderes:** Todos os parâmetros do protocolo, alocação de treasury, upgrades
- **Mecanismo:** Contrato Governor (OpenZeppelin Governor + Timelock)
- **Período:** Mês 12+

---

## 9. Modelo de Receita

| Fonte | Taxa | Destino |
|---|---|---|
| Swap na DEX | 0,30% | 0,25% para LPs, 0,05% para Treasury |
| Aposentadoria de dCARBON | 2,00% | Treasury → buyback & burn de DLUZ |
| Mint de dCARBON (verificador) | 1,00% | Treasury |

### Gestão do Treasury

- Treasury é multisig (Fase 1) → Timelock + Governor (Fase 3)
- Receita financia: desenvolvimento do protocolo, auditorias, parcerias, liquidez
- Relatórios de transparência mensais on-chain

---

## 10. Segurança

### 10.1 Segurança dos Smart Contracts

- **OpenZeppelin v5** — contratos base auditados e battle-tested
- **AccessControl** — permissões baseadas em roles (MINTER_ROLE, DEFAULT_ADMIN_ROLE)
- **Pausable** — parada de emergência no CarbonRegistry
- **Limites de taxa** — previnem má configuração (máx 100:1 energy, 1000:1 DLUZ)
- **Validação de inputs** — checagens de valor zero, reason vazio, endereço zero
- **Sem proxy/upgradeable** — contratos imutáveis, sem vetor de rug pelo admin

### 10.2 Segurança Operacional

- Chaves do deployer em hardware wallet
- Multisig para operações de treasury
- Programa de bug bounty (crítico: até US$ 50.000)

### 10.3 Cobertura de Testes

- 76 testes cobrindo todos os contratos
- Cobertura de branches para edge cases (taxas zero, truncamento, transferências falhadas)
- Suite de testes específica de segurança (pausable, limites de taxa, tamanho do reason)

### 10.4 Plano de Auditoria

| Fase | Escopo | Alvo |
|---|---|---|
| Pré-lançamento | Contratos core (3 tokens + Registry) | Q1 2026 |
| Pós-DEX | DEX Router, Factory, Pools | Q2 2026 |
| Anual | Protocolo completo | Contínuo |

---

## 11. Roadmap

| Trimestre | Marco |
|---|---|
| **Q1 2026** | Deploy na testnet (Base Sepolia). Contratos core auditados. Landing page no ar. |
| **Q2 2026** | Lançamento na mainnet. DEX ativa. Primeiro mint de dCARBON de projeto verificado. |
| **Q3 2026** | Pools de farming. Integração com oracle para verificadores. App mobile. |
| **Q4 2026** | Governança DAO. Bridge cross-chain (Arbitrum, Polygon). |
| **2027** | API institucional. Marketplace de RWA. Futuros de crédito de carbono. |

---

## 12. Aviso Legal

Os tokens do dLuz Protocol (DLUZ, dCARBON, dENERGY) são **tokens de utilidade**. Não representam valores mobiliários, participação societária, dívida ou propriedade em qualquer entidade.

- dCARBON representa um direito sobre a aposentadoria de um crédito de carbono verificado, não o crédito em si.
- dENERGY representa um direito sobre um REC verificado, não o certificado em si.
- DLUZ é um token de governança e utilidade sem promessa de retorno financeiro.

Usuários são responsáveis pela conformidade com regulamentações locais. A dLuz Foundation não fornece aconselhamento financeiro, jurídico ou tributário.

---

## Contato

- **Website:** [dluz.cc](https://dluz.cc)
- **GitHub:** [github.com/carloshenmes/dluz-protocol](https://github.com/carloshenmes/dluz-protocol)
- **X (Twitter):** [@dluz_protocol](https://x.com/dluz_protocol)

---

*dLuz Protocol — Whitepaper v1.0 — Fevereiro 2026*
*© 2026 dLuz Foundation. Todos os direitos reservados.*
