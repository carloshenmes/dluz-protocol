# dLuz Protocol

<div align="center">

**The Decentralized Exchange for Environmental Assets**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Built on Base](https://img.shields.io/badge/Built%20on-Base-0052FF.svg)](https://base.org)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636.svg)](https://soliditylang.org)
[![Coverage](https://img.shields.io/badge/Coverage-98.5%25-brightgreen.svg)](#-test-coverage)
[![Tests](https://img.shields.io/badge/Tests-64%20passing-brightgreen.svg)](#-test-coverage)

[Website](https://dluz.cc) · [Whitepaper](./docs/WHITEPAPER.md) · [Whitepaper PT](./docs/WHITEPAPER_PT.md) · [Tokenomics](./docs/TOKENOMICS.md)

</div>

---

## 🇺🇸 English

### 🌍 What is dLuz?

dLuz is a decentralized protocol built on **Base** (Ethereum L2) for registering, trading, and retiring tokenized environmental assets — carbon credits and renewable energy certificates (RECs).

We bring **transparency**, **accessibility**, and **liquidity** to the environmental asset market through on-chain registration and an AMM (Automated Market Maker) model.

### ❓ Why dLuz?

| Problem | dLuz Solution |
|---------|---------------|
| Carbon market is opaque and fragmented | Fully transparent, on-chain transactions |
| Only large corporations can participate | Anyone can buy fractional carbon credits |
| High fees and slow settlement | Ultra-low fees on Base (< $0.01 per tx) |
| No unified decentralized marketplace | Single DEX for all environmental assets |

### 🔑 Key Features

- 🌿 **Carbon Credit Registration** — On-chain registry of tokenized carbon credits ($dCARBON)
- ⚡ **Renewable Energy Certificates** — Trade tokenized RECs ($dENERGY)
- 🍀 **DLUZ Rewards** — Earn $DLUZ for registering environmental projects
- 🗳 **Governance** — $DLUZ holders vote on protocol decisions
- 🔥 **Carbon Retirement** — Permanently retire credits with public on-chain proof
- 📊 **Carbon Dashboard** — Real-time tracking of retired carbon credits
- 💸 **Ultra-low fees** — Built on Base (transactions < $0.01)

### 📜 Deployed Contracts (Base Sepolia)

| Contract | Address | Explorer |
|----------|---------|----------|
| **DLuzToken** | `0xBfeE6d11634376aB33E47d81531FE36522e051f9` | [View](https://sepolia.basescan.org/address/0xBfeE6d11634376aB33E47d81531FE36522e051f9#code) |
| **DCarbonToken** | `0x60492A78113F655EFdC5aB88B6c86f152b23A2e2` | [View](https://sepolia.basescan.org/address/0x60492A78113F655EFdC5aB88B6c86f152b23A2e2#code) |
| **DEnergyToken** | `0x3143C0F114224C7CdeF74CeD31306853E45B593A` | [View](https://sepolia.basescan.org/address/0x3143C0F114224C7CdeF74CeD31306853E45B593A#code) |
| **CarbonRegistry** | `0x9cABBdD0B60A84Fc1034BEEa0E81900bf7fE3E65` | [View](https://sepolia.basescan.org/address/0x9cABBdD0B60A84Fc1034BEEa0E81900bf7fE3E65#code) |

> All contracts verified on BaseScan ✅

### 🏗️ Architecture

```text
┌─ Frontend (Next.js + Wagmi + RainbowKit) ────────┐
│  Swap · Pools · Farms · Carbon Dashboard          │
└───────────────────────┬───────────────────────────┘
                        │ RPC (Alchemy / Infura)
┌───────────────────────▼───────────────────────────┐
│  Base Network (Ethereum L2)                        │
│                                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ │
│  │    Tokens    │ │  CarbonReg  │ │   DEX (v2)    │ │
│  │ $DLUZ        │ │ register   │ │ DLuzFactory  │ │
│  │ $dCARBON     │ │ retire     │ │ DLuzRouter   │ │
│  │ $dENERGY     │ │ revoke     │ │ DLuzFarm     │ │
│  └─────────────┘ └─────────────┘ └──────────────┘ │
└────────────────────────────────────────────────────┘
```

### 🪙 Tokens

| Token | Symbol | Type | Function |
|-------|--------|------|----------|
| dLuz Token | `$DLUZ` | Governance & Utility | Voting, staking, fee discounts |
| Carbon Credit | `$dCARBON` | Real-world asset backed | 1 token = 1 tonne CO₂ offset |
| Renewable Energy | `$dENERGY` | Real-world asset backed | 1 token = 1 MWh clean energy |

### 🧪 Test Coverage

```
64 passing (4s)

File                 |  % Stmts | % Branch |  % Funcs |  % Lines
---------------------|----------|----------|----------|----------
 CarbonRegistry.sol  |    98.04 |    92.86 |      100 |      100
 DCarbonToken.sol    |      100 |      100 |      100 |      100
 DEnergyToken.sol    |      100 |      100 |      100 |      100
 DLuzToken.sol       |      100 |      100 |      100 |      100
---------------------|----------|----------|----------|----------
 All files           |    98.46 |       94 |      100 |      100
```

### 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contracts | Solidity ^0.8.20 + OpenZeppelin 5.x + Hardhat |
| Frontend | Next.js 14 + TypeScript + Wagmi v2 + RainbowKit |
| Network | Base (Ethereum L2 by Coinbase) |
| Indexing | The Graph |
| Hosting | Vercel |
| Domain | dluz.cc |

### 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/carloshenmes/dluz-protocol.git
cd dluz-protocol

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your keys

# Compile smart contracts
npx hardhat compile

# Run tests
npx hardhat test

# Run coverage
npx hardhat coverage

# Deploy to Base Sepolia testnet
npx hardhat run scripts/deploy.js --network baseSepolia
```

### 📋 Environment Variables

```env
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
ALCHEMY_API_KEY=your_alchemy_api_key
BASESCAN_API_KEY=your_basescan_api_key
```

### 📋 Roadmap

| Phase | Period | Deliverables | Status |
|-------|--------|-------------|--------|
| 🌱 Seed | Q1 2026 | Smart contracts on Base Sepolia. Tests 98.5% coverage. Whitepaper v1 | ✅ Done |
| 🌿 Sprout | Q2 2026 | Frontend MVP. Base mainnet deploy. Initial pools. $DLUZ airdrop | 📋 Planned |
| 🌳 Growth | Q3 2026 | Yield Farming. Carbon certifier partnerships. Analytics | 📋 Planned |
| 🌎 Canopy | Q4 2026 | DAO governance. Project marketplace. SBCE integration | 📋 Planned |

---

## 🇧🇷 Português

### 🌍 O que é o dLuz?

O dLuz é um protocolo descentralizado construído na **Base** (Ethereum L2) para registro, negociação e aposentadoria de ativos ambientais tokenizados — créditos de carbono e certificados de energia renovável (RECs).

Trazemos **transparência**, **acessibilidade** e **liquidez** ao mercado de ativos ambientais através do modelo AMM (Automated Market Maker) e registro on-chain.

### ❓ Por que dLuz?

| Problema | Solução dLuz |
|----------|-------------|
| Mercado de carbono é opaco e fragmentado | Transações totalmente transparentes, on-chain |
| Somente grandes corporações participam | Qualquer pessoa pode comprar frações de créditos |
| Taxas altas e liquidação lenta | Taxas ultra-baixas na Base (< $0.01 por tx) |
| Sem marketplace descentralizado unificado | Uma DEX para todos os ativos ambientais |

### 🔑 Funcionalidades

- 🌿 **Registro de Créditos de Carbono** — Registro on-chain de créditos tokenizados ($dCARBON)
- ⚡ **Certificados de Energia Renovável** — RECs tokenizados ($dENERGY)
- 🍀 **Recompensas DLUZ** — Ganhe $DLUZ ao registrar projetos ambientais
- 🗳 **Governança** — Holders de $DLUZ votam nas decisões do protocolo
- 🔥 **Aposentadoria de Carbono** — Aposente créditos permanentemente com prova on-chain
- 📊 **Carbon Dashboard** — Rastreamento em tempo real de créditos aposentados
- 💸 **Taxas ultra-baixas** — Construído na Base (transações < $0.01)

### 📜 Contratos Deployados (Base Sepolia)

| Contrato | Endereço | Explorer |
|----------|----------|----------|
| **DLuzToken** | `0xBfeE6d11634376aB33E47d81531FE36522e051f9` | [Ver](https://sepolia.basescan.org/address/0xBfeE6d11634376aB33E47d81531FE36522e051f9#code) |
| **DCarbonToken** | `0x60492A78113F655EFdC5aB88B6c86f152b23A2e2` | [Ver](https://sepolia.basescan.org/address/0x60492A78113F655EFdC5aB88B6c86f152b23A2e2#code) |
| **DEnergyToken** | `0x3143C0F114224C7CdeF74CeD31306853E45B593A` | [Ver](https://sepolia.basescan.org/address/0x3143C0F114224C7CdeF74CeD31306853E45B593A#code) |
| **CarbonRegistry** | `0x9cABBdD0B60A84Fc1034BEEa0E81900bf7fE3E65` | [Ver](https://sepolia.basescan.org/address/0x9cABBdD0B60A84Fc1034BEEa0E81900bf7fE3E65#code) |

> Todos os contratos verificados no BaseScan ✅

### 🏗️ Arquitetura

```text
┌─ Frontend (Next.js + Wagmi + RainbowKit) ────────┐
│  Swap · Pools · Farms · Carbon Dashboard          │
└───────────────────────┬───────────────────────────┘
                        │ RPC (Alchemy / Infura)
┌───────────────────────▼───────────────────────────┐
│  Base Network (Ethereum L2)                        │
│                                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ │
│  │    Tokens    │ │  CarbonReg  │ │   DEX (v2)    │ │
│  │ $DLUZ        │ │ register   │ │ DLuzFactory  │ │
│  │ $dCARBON     │ │ retire     │ │ DLuzRouter   │ │
│  │ $dENERGY     │ │ revoke     │ │ DLuzFarm     │ │
│  └─────────────┘ └─────────────┘ └──────────────┘ │
└────────────────────────────────────────────────────┘
```

### 🪙 Tokens

| Token | Símbolo | Tipo | Função |
|-------|---------|------|--------|
| dLuz Token | `$DLUZ` | Governança & Utilidade | Votação, staking, desconto em taxas |
| Crédito de Carbono | `$dCARBON` | Lastro em ativo real | 1 token = 1 tonelada CO₂ compensada |
| Energia Renovável | `$dENERGY` | Lastro em ativo real | 1 token = 1 MWh de energia limpa |

### 🛠 Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| Smart Contracts | Solidity ^0.8.20 + OpenZeppelin 5.x + Hardhat |
| Frontend | Next.js 14 + TypeScript + Wagmi v2 + RainbowKit |
| Rede | Base (Ethereum L2 da Coinbase) |
| Indexação | The Graph |
| Hospedagem | Vercel |
| Domínio | dluz.cc |

### 🚀 Início Rápido

```bash
# Clonar o repositório
git clone https://github.com/carloshenmes/dluz-protocol.git
cd dluz-protocol

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Edite .env com suas chaves

# Compilar smart contracts
npx hardhat compile

# Rodar testes
npx hardhat test

# Cobertura de testes
npx hardhat coverage

# Deploy na testnet Base Sepolia
npx hardhat run scripts/deploy.js --network baseSepolia
```

### 📋 Roadmap

| Fase | Período | Entregas | Status |
|------|---------|----------|--------|
| 🌱 Seed | Q1 2026 | Smart contracts na Base Sepolia. Testes 98.5% coverage. Whitepaper v1 | ✅ Concluído |
| 🌿 Sprout | Q2 2026 | Frontend MVP. Deploy na Base mainnet. Pools iniciais. Airdrop de $DLUZ | 📋 Planejado |
| 🌳 Growth | Q3 2026 | Yield Farming. Parcerias com certificadoras. Analytics | 📋 Planejado |
| 🌎 Canopy | Q4 2026 | Governança DAO. Marketplace de projetos. Integração SBCE | 📋 Planejado |

---

## 📁 Project Structure

```text
dluz-protocol/
├── contracts/
│   ├── tokens/
│   │   ├── DLuzToken.sol           # $DLUZ — Governance & utility token
│   │   ├── DCarbonToken.sol        # $dCARBON — Carbon credit token
│   │   └── DEnergyToken.sol        # $dENERGY — Renewable energy token
│   └── registry/
│       └── CarbonRegistry.sol      # Carbon credit registry & retirement
├── scripts/
│   ├── deploy.js                   # Full deployment + verification
│   ├── setup-roles.js              # Role configuration
│   └── test-registry.js            # Registry interaction test
├── test/
│   ├── CarbonRegistry.test.js      # Registry tests (39 tests)
│   ├── DCarbonToken.test.js        # dCARBON tests (7 tests)
│   ├── DEnergyToken.test.js        # dENERGY tests (7 tests)
│   └── DLuzToken.test.js           # DLUZ tests (11 tests)
├── deployments/
│   └── baseSepolia.json            # Deployed addresses
├── .env.example
├── .gitignore
├── hardhat.config.js
├── package.json
├── LICENSE
└── README.md
```

---

## 🤝 Contributing / Contribuindo

Contributions are welcome! / Contribuições são bem-vindas!

1. Fork the project / Faça um fork
2. Create your branch / Crie sua branch (`git checkout -b feature/new-feature`)
3. Commit your changes / Commit (`git commit -m 'Add new feature'`)
4. Push to branch / Push (`git push origin feature/new-feature`)
5. Open a Pull Request / Abra um Pull Request

---

## 📄 License / Licença

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

**dLuz Protocol** — Illuminating the path to a sustainable future 🌱

Made with 💚 in Brazil 🇧🇷

[⬆ Back to top](#dluz-protocol)

</div>
