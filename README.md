<div align="center">

# 🌿⚡ dLuz Protocol

### Decentralized Exchange for Tokenized Environmental Assets
### Exchange Descentralizada para Ativos Ambientais Tokenizados

[![Built on Base](https://img.shields.io/badge/Built%20on-Base-0052FF?style=for-the-badge&logo=coinbase)](https://base.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?style=for-the-badge&logo=solidity)](https://soliditylang.org/)

**Trade carbon credits and renewable energy certificates on-chain.**
**Negocie créditos de carbono e certificados de energia renovável on-chain.**

[Whitepaper](./docs/WHITEPAPER.md) · [Tokenomics](./docs/TOKENOMICS.md) · [App](https://dluz.cc) · [Discord](#) · [Twitter/X](#)

---

🌐 **[English](#-english)** | **[Português](#-português)**

</div>

---

## 🇺🇸 English

### 🌍 What is dLuz?

dLuz is a decentralized exchange (DEX) built on **Base** (Ethereum L2) specialized in trading tokenized environmental assets — carbon credits and renewable energy certificates (RECs).

We bring **transparency**, **accessibility**, and **liquidity** to the environmental asset market through an AMM (Automated Market Maker) model.

### ❓ Why dLuz?

| Problem | dLuz Solution |
|---------|---------------|
| Carbon market is opaque and fragmented | Fully transparent, on-chain transactions |
| Only large corporations can participate | Anyone can buy fractional carbon credits |
| High fees and slow settlement | Ultra-low fees on Base (< $0.01 per tx) |
| No unified decentralized marketplace | Single DEX for all environmental assets |

### 🔑 Key Features

- 🌿 **Carbon Credit Trading** — Buy and sell tokenized carbon credits ($dCARBON)
- ⚡ **Renewable Energy Certificates** — Trade tokenized RECs ($dENERGY)
- 🌾 **Yield Farming** — Earn $DLUZ by providing liquidity to green pools
- 🗳️ **Governance** — $DLUZ holders vote on protocol decisions
- 📊 **Carbon Dashboard** — Real-time tracking of retired carbon credits
- 💸 **Ultra-low fees** — Built on Base (transactions < $0.01)

### 🏗️ Architecture

┌─ Frontend (Next.js + Wagmi + RainbowKit) ────────┐
│  Swap · Pools · Farms · Carbon Dashboard          │
└───────────────────────┬───────────────────────────┘
                        │ RPC (Alchemy / Infura)
┌───────────────────────▼───────────────────────────┐
│  Base Network (Ethereum L2)                        │
│                                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ │
│  │ DLuzFactory │ │ DLuzRouter  │ │    Tokens     │ │
│  │ Creates     │ │ Executes    │ │ $DLUZ        │ │
│  │ pairs       │ │ swaps       │ │ $dCARBON     │ │
│  │             │ │             │ │ $dENERGY     │ │
│  └─────────────┘ └─────────────┘ └──────────────┘ │
│  ┌─────────────┐ ┌──────────────────────────────┐  │
│  │ DLuzFarm    │ │ CarbonRetirement Registry    │  │
│  │ Yield       │ │ Public record of retired     │  │
│  │ Farming     │ │ carbon credits               │  │
│  └─────────────┘ └──────────────────────────────┘  │
└───────────────────────────────────────────────────

### 🪙 Tokens

| Token | Símbolo | Tipo | Função |
|-------|---------|------|--------|
| dLuz Token | `$DLUZ` | Governança & Utilidade | Votação, staking, desconto em taxas |
| Crédito de Carbono | `$dCARBON` | Lastro em ativo real | 1 token = 1 tonelada CO₂ compensada |
| Energia Renovável | `$dENERGY` | Lastro em ativo real | 1 token = 1 MWh de energia limpa |


### 🛠️ Tech Stack


| Layer | Technology |
| --- | --- |
| Smart Contracts | Solidity ^0.8.20 + OpenZeppelin + Hardhat |
| Frontend | Next.js 14 + TypeScript + Wagmi v2 + RainbowKit |
| Network | Base (Ethereum L2 by Coinbase) |
| Indexing | The Graph |
| Hosting | Vercel |
| Domain | dluz.cc |


### 🚀 Quick Start

# Clone the repository
git clone https://github.com/carloshenmes/dluz-protocol.git
cd dluz-protocol

# Install dependencies
npm install

# Compile smart contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Base Sepolia testnet
npx hardhat run scripts/deploy.js --network baseSepolia

### 📋 Roadmap

| Phase | Period | Deliverables | Status |
| --- | --- | --- | --- |
| 🌱 Seed | Q1 2026 | Smart contracts on Base Sepolia. Frontend MVP. Whitepaper v1 | 🔄 In Progress |
| 🌿 Sprout | Q2 2026 | Base mainnet deploy. Initial pools. $DLUZ airdrop | ⏳ Planned |
| 🌳 Growth | Q3 2026 | Yield Farming. Carbon certifier partnerships. Analytics | ⏳ Planned |
| 🌍 Canopy | Q4 2026 | DAO governance. Project marketplace. SBCE integration | ⏳ Planned |


### 🇧🇷 Português

🌍 O que é o dLuz?
O dLuz é uma exchange descentralizada (DEX) construída na Base (Ethereum L2) especializada na negociação de ativos ambientais tokenizados — créditos de carbono e certificados de energia renovável (RECs).

Trazemos transparência, acessibilidade e liquidez ao mercado de ativos ambientais através do modelo AMM (Automated Market Maker).

### ❓ Por que dLuz?

| Problema | Solução dLuz |
| --- | --- |
| Mercado de carbono é opaco e fragmentado | Transações totalmente transparentes, on-chain |
| Somente grandes corporações participam | Qualquer pessoa pode comprar frações de créditos |
| Taxas altas e liquidação lenta | Taxas ultra-baixas na Base (< $0.01 por tx) |
| Sem marketplace descentralizado unificado | Uma DEX para todos os ativos ambientais |

### 🔑 Funcionalidades
.🌿 Negociação de Créditos de Carbono — Compre e venda créditos tokenizados ($dCARBON)
.⚡ Certificados de Energia Renovável — Negocie RECs tokenizados ($dENERGY)
.🌾 Yield Farming — Ganhe $DLUZ fornecendo liquidez aos pools verdes
.🗳️ Governança — Holders de $DLUZ votam nas decisões do protocolo
.📊 Carbon Dashboard — Rastreamento em tempo real de créditos aposentados
.💸 Taxas ultra-baixas — Construído na Base (transações < $0.01)

###🏗️ Arquitetura

┌─ Frontend (Next.js + Wagmi + RainbowKit) ────────┐
│  Swap · Pools · Farms · Carbon Dashboard          │
└───────────────────────┬───────────────────────────┘
                        │ RPC (Alchemy / Infura)
┌───────────────────────▼───────────────────────────┐
│  Base Network (Ethereum L2)                        │
│                                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ │
│  │ DLuzFactory │ │ DLuzRouter  │ │    Tokens     │ │
│  │ Cria pares  │ │ Executa     │ │ $DLUZ        │ │
│  │ de tokens   │ │ swaps       │ │ $dCARBON     │ │
│  │             │ │             │ │ $dENERGY     │ │
│  └─────────────┘ └─────────────┘ └──────────────┘ │
│  ┌─────────────┐ ┌──────────────────────────────┐  │
│  │ DLuzFarm    │ │ CarbonRetirement Registry    │  │
│  │ Yield       │ │ Registro público de créditos │  │
│  │ Farming     │ │ de carbono aposentados       │  │
│  └─────────────┘ └──────────────────────────────┘  │
└───────────────────────────────────────────────────┘

### 🪙 Tokens


| Token | Símbolo | Tipo | Função |
| --- | --- | --- | --- |
| dLuz Token | $DLUZ | Governança & Utilidade | Votação, staking, desconto em taxas |
| Crédito de Carbono | $dCARBON | Lastro em ativo real | 1 token = 1 tonelada CO₂ compensada |
| Energia Renovável | $dENERGY | Lastro em ativo real | 1 token = 1 MWh de energia limpa |


### 🚀 Início Rápido

# Clone o repositório
git clone https://github.com/carloshenmes/dluz-protocol.git
cd dluz-protocol

# Instale as dependências
npm install

# Compile os smart contracts
npx hardhat compile

# Execute os testes
npx hardhat test

# Deploy na testnet Base Sepolia
npx hardhat run scripts/deploy.js --network baseSepolia

### 📋 Roadmap

| Fase | Período | Entregas | Status |
| --- | --- | --- | --- |
| 🌱 Seed | Q1 2026 | Smart contracts na Base Sepolia. Frontend MVP. Whitepaper v1 | 🔄 Em Andamento |
| 🌿 Sprout | Q2 2026 | Deploy na Base mainnet. Pools iniciais. Airdrop de $DLUZ | ⏳ Planejado |
| 🌳 Growth | Q3 2026 | Yield Farming. Parcerias com certificadoras. Analytics | ⏳ Planejado |
| 🌍 Canopy | Q4 2026 | Governança DAO. Marketplace de projetos. Integração SBCE | ⏳ Planejado |


dluz-protocol/
├── contracts/
│   ├── tokens/
│   │   ├── DLuzToken.sol          # $DLUZ — Governance token
│   │   ├── DCarbonToken.sol       # $dCARBON — Carbon credit token
│   │   └── DEnergyToken.sol       # $dENERGY — Renewable energy token
│   ├── dex/
│   │   ├── DLuzFactory.sol        # Creates trading pairs
│   │   └── DLuzRouter.sol         # Executes swaps
│   ├── farming/
│   │   └── DLuzFarm.sol           # Yield farming
│   └── registry/
│       └── CarbonRegistry.sol     # Carbon retirement registry
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── styles/
│   ├── public/
│   └── package.json
├── scripts/
│   ├── deploy.js                  # Main deploy script
│   └── verify.js                  # Contract verification
├── test/
│   ├── DLuzToken.test.js
│   ├── DCarbonToken.test.js
│   └── DLuzFactory.test.js
├── docs/
│   ├── WHITEPAPER.md
│   ├── WHITEPAPER_PT.md
│   └── TOKENOMICS.md
├── .env.example
├── .gitignore
├── hardhat.config.js
├── package.json
├── LICENSE
└── README.md

### 🤝 Contributing / Contribuindo
Contributions are welcome! / Contribuições são bem-vindas!

1.Fork the project / Faça um fork
2.Create your branch / Crie sua branch (git checkout -b feature/new-feature)
3.Commit your changes / Commit (git commit -m 'Add new feature')
4.Push to branch / Push (git push origin feature/new-feature)
5.Open a Pull Request / Abra um Pull Request

### 📜 License / Licença
This project is licensed under the MIT License — see LICENSE [blocked] for details.

Este projeto está licenciado sob a Licença MIT — veja LICENSE [blocked] para detalhes.

Built with 🌿 for a sustainable future Construído com 🌿 por um futuro sustentável

dluz.cc · Twitter/X [blocked] · Discord [blocked]