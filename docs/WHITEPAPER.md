# dLuz Protocol — Whitepaper v2.0

> Decentralized Carbon Credits & Renewable Energy on Base
> Last updated: February 2026

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Problem Statement](#2-problem-statement)
3. [Solution](#3-solution)
4. [Protocol Architecture](#4-protocol-architecture)
5. [Tokens](#5-tokens)
6. [CarbonBridge — 1:1 Backing Mechanism](#6-carbonbridge--11-backing-mechanism)
7. [Carbon Retirement System](#7-carbon-retirement-system)
8. [DLuz Sale](#8-dluz-sale)
9. [DEX and Liquidity](#9-dex-and-liquidity)
10. [Farming and Rewards](#10-farming-and-rewards)
11. [Tokenomics](#11-tokenomics)
12. [Governance Roadmap](#12-governance-roadmap)
13. [Revenue Model](#13-revenue-model)
14. [Carbon Market Context](#14-carbon-market-context)
15. [Technical Stack](#15-technical-stack)
16. [Security](#16-security)
17. [Roadmap](#17-roadmap)
18. [Legal Disclaimer](#18-legal-disclaimer)
19. [References](#19-references)

---

## 1. Abstract

dLuz Protocol is a DeFi protocol built on Base (Coinbase Ethereum L2) that bridges the voluntary carbon market and renewable energy certificates (RECs) to the blockchain. It enables transparent issuance, trading, retirement, and verification of environmental assets through three interconnected ERC-20 tokens: DLUZ, dCARBON, and dENERGY.

The protocol eliminates intermediaries, reduces fraud through on-chain traceability, and creates economic incentives for carbon offsetting via a burn-to-earn mechanism. A dedicated CarbonBridge contract ensures every dCARBON in circulation is backed 1:1 by verified BCT (Base Carbon Tonne) locked on-chain.

All 9 contracts are deployed and verified on Base Sepolia (testnet). The frontend supports PT-BR and EN with persistent language toggle.

---

## 2. Problem Statement

The voluntary carbon credit market is projected to reach $50B by 2030 (McKinsey, 2023). Yet it suffers from critical issues:

- **Double counting** — the same credit sold multiple times across registries.
- **Opacity** — buyers cannot independently verify credit origin or retirement.
- **High fees** — brokers and intermediaries capture 15-30% of value.
- **Fragmentation** — RECs and carbon credits live in disconnected systems.
- **No composability** — credits cannot interact with DeFi primitives (lending, LP, staking).

Brazil, home to the Amazon rainforest and one of the world's cleanest energy matrices (83% renewable), is uniquely positioned but lacks on-chain infrastructure to connect these assets to global DeFi markets.

---

## 3. Solution

dLuz unifies carbon credits and RECs into a single on-chain protocol:

| Feature | Mechanism |
|---|---|
| Anti-double-counting | Each credit is a unique mint tx on Base. Burn = permanent retirement. |
| Full transparency | All mints, transfers, retirements are public on-chain. |
| 1:1 verifiable backing | CarbonBridge locks BCT for every dCARBON minted. Backing Ratio = 100%. |
| Low fees | 2% retire fee + 0.3% swap fee vs. 15-30% traditional. |
| Unified system | dCARBON (carbon) and dENERGY (RECs) in one protocol. |
| DeFi composability | Tokens work with any ERC-20 compatible protocol. |
| Multilingual | Frontend in PT-BR and EN with localStorage persistence. |

---

## 4. Protocol Architecture

The protocol is composed of 9 smart contracts working together:

### 4.1 Contract Map

dLuz Protocol | |-- DLuzToken (ERC-20) .......... Governance + Utility + Rewards |-- DCarbonToken (ERC-20) ....... Tokenized carbon credits |-- DEnergyToken (ERC-20) ....... Tokenized RECs | |-- CarbonBridge ................ BCT to dCARBON bridge (1:1 backing) |-- CarbonRegistry .............. Retirement logic, rates, rewards |-- MockBCT ..................... Test BCT token (testnet only) | |-- DLuzDEX ..................... Swap and liquidity pools (AMM) |-- DLuzFarming ................. Yield farming (stake dLuz, earn rewards) |-- DLuzSale .................... Token pre-sale (ETH to dLuz) | |-- Base Sepolia (Testnet) |-- Base Mainnet (Production target Q2 2026) |-- Ethereum L1 (Settlement)




### 4.2 Deployed Contracts (Base Sepolia)

| Contract | Address | Role |
|---|---|---|
| DLuzToken | 0xF0807462147C10Eae2B53fa64C736d73A541950c | Governance + utility + rewards |
| DCarbonToken | 0x87605261111208e9f57CbA884d7c2bEcFe81C45D | Tokenized carbon credits |
| DEnergyToken | 0x8919646FAe7283842090eb86BA02D4683e501934 | Tokenized RECs |
| CarbonRegistry | 0x73fdbf1652Dc01b8104b127c48B064BE94bD4fBf | Retirement logic, rate management |
| CarbonBridge | 0xB7a98b07DD1D73b111D2679ED219eE4693F9505B | BCT to dCARBON bridge (1:1) |
| MockBCT | 0x313c8F9B7cFFcE27FE0AF4b12344d3b66cFf5F2E | Test BCT token (testnet only) |
| DLuzDEX | 0xc9284747A7DC88C08CD7A8051c262a101F24E6f3 | Swap and liquidity pools |
| DLuzFarming | 0x2ef3BFE8C997e031fff8992658C2Ac653b29b30a | Yield farming rewards |
| DLuzSale | 0xc6a59D50BE58FA91b430b3a6baA3a51Dc1194d35 | Token pre-sale (ETH to dLuz) |

**Network:** Base Sepolia (Chain ID: 84532)
**Deployer:** 0x4aF510c05cf652341d4870Fabd6f25Ceff881B0E
**Compiler:** Solidity 0.8.28, EVM target Paris
**Libraries:** OpenZeppelin v5 (audited)

### 4.3 User Flow

User connects wallet (RainbowKit) | |-- Buy dLuz --> DLuzSale --> ETH in, dLuz out (fixed rate) | |-- Deposit BCT --> CarbonBridge --> dCARBON minted (1:1) | |-- Stake dLuz --> DLuzFarming --> Earn dCARBON or dENERGY | |-- Retire dCARBON --> CarbonBridge or CarbonRegistry | |-- Permanent burn | |-- On-chain certificate | |-- dLuz + dENERGY rewards (via Registry) | |-- Trade --> DLuzDEX --> Swap between all protocol tokens




---

## 5. Tokens

### 5.1 DLUZ — Governance and Utility

| Property | Value |
|---|---|
| Name | dLuz Token |
| Symbol | DLUZ |
| Max Supply | 1,000,000,000 (1B) |
| Initial Mint | 300,000,000 (300M) to deployer |
| Mintable | Yes, by owner, up to max supply |
| Burnable | Yes, by any holder |
| Permit | ERC-2612 (gasless approvals) |

Use cases:

- Retirement rewards (burn dCARBON, earn DLUZ)
- DEX liquidity provision
- Farming rewards
- Future governance voting
- Pre-sale via DLuzSale contract

### 5.2 dCARBON — Carbon Credits

| Property | Value |
|---|---|
| Name | dCarbon Token |
| Symbol | dCARBON |
| Max Supply | Unlimited (mint on demand) |
| Mintable | MINTER_ROLE only (CarbonBridge or authorized entities) |
| Burnable | By holder (retire) or via CarbonBridge / CarbonRegistry |
| Peg | 1 dCARBON = 1 tCO2e = 1 BCT locked |

Lifecycle:

1. User deposits BCT into CarbonBridge
2. CarbonBridge locks BCT and mints dCARBON 1:1
3. User trades, holds, stakes, or retires dCARBON
4. On retirement: dCARBON is burned permanently + rewards distributed
5. Backing Ratio verifiable on-chain at any time

### 5.3 dENERGY — Renewable Energy Certificates

| Property | Value |
|---|---|
| Name | dEnergy Token |
| Symbol | dENERGY |
| Max Supply | Unlimited (minted on retirement events) |
| Mintable | MINTER_ROLE only |
| Burnable | By holder (redeem) |
| Peg | 1 dENERGY = 1 MWh renewable energy generated |

Generation: minted automatically when dCARBON is retired via CarbonRegistry. Rate configurable by owner (default 1:1).

---

## 6. CarbonBridge — 1:1 Backing Mechanism

The CarbonBridge is the core infrastructure that links real-world carbon credits to on-chain tokens. It ensures every dCARBON in circulation is backed by a real BCT locked in the contract.

### 6.1 How It Works

**Deposit flow:**
User sends BCT to CarbonBridge. Bridge locks the BCT. Bridge mints dCARBON to user. Ratio is always 1 BCT = 1 dCARBON.

**Retire flow:**
User sends dCARBON to CarbonBridge. Bridge burns the dCARBON permanently. Emits CarbonRetired event with user address, amount, reason, and timestamp. This is irreversible.

**Backing Ratio:**
BCT locked in contract divided by dCARBON total supply = 100%. This is verifiable on-chain at any time via getBackingBalance().

### 6.2 Why 1:1 Is the Correct Approach

The BCT (Base Carbon Tonne) from Toucan Protocol represents 1 verified tonne of CO2 under the Verra VCS standard. The dCARBON wrapping maintains this unit equivalence:

**1 BCT = 1 tCO2 = 1 dCARBON**

This is the industry standard used by:

- **Toucan Protocol** — pioneer in on-chain carbon tokenization
- **KlimaDAO** — largest carbon-backed treasury in DeFi
- **C3** — carbon credit bridging protocol

### 6.3 Price Context

The market price of BCT (~$0.08) reflects crypto voluntary market supply and demand, not the intrinsic value of one tonne of CO2.

| Market | Price per tCO2 | Notes |
|---|---|---|
| BCT (Toucan/crypto) | ~$0.08 | Voluntary crypto market, oversupplied since 2022 |
| Verra VCS (OTC) | $2-15 | Depending on project type and vintage |
| EU ETS (regulated) | EUR 60-90 | Regulated, compliance-driven |
| CORSIA (aviation) | $5-15 | International aviation offset scheme |
| SBCE Brazil (projected) | R$50-150 | Brazil regulated market (2029+) |

The 1:1 ratio ensures:

1. **Trust** — every dCARBON has a real BCT locked behind it
2. **Arbitrage equilibrium** — price deviations are corrected by market participants
3. **Auditability** — backing ratio verifiable on-chain in real-time
4. **Compatibility** — standard unit allows future integration with SBCE and CBEs

### 6.4 Contract Functions

| Function | Description |
|---|---|
| deposit(token, amount) | Lock BCT, mint equivalent dCARBON |
| retire(amount, reason) | Burn dCARBON permanently with on-chain record |
| getBackingBalance(token) | View total BCT locked in bridge |
| isAcceptedToken(token) | Check if a token is accepted for deposit |

---

## 7. Carbon Retirement System

The protocol offers two retirement paths:

### 7.1 Via CarbonBridge (Direct)

Simple burn of dCARBON with reason string. Emits CarbonRetired event. No additional rewards.

### 7.2 Via CarbonRegistry (Full Rewards)

Complete retirement flow with dLuz and dENERGY rewards:

1. User calls CarbonRegistry.retire(amount, reason)
2. Validates: amount > 0, reason not empty, balance sufficient
3. Burns dCARBON from caller
4. Mints dENERGY to caller (amount x energyRate / 1e18). Skipped if energyRate = 0.
5. Transfers DLUZ from Treasury to caller (amount x dluzRewardRate / 1e18). Skipped if dluzRewardRate = 0.
6. Records retirement on-chain (who, amount, reason, timestamp)
7. Emits: CarbonRetired, EnergyMinted, DluzRewarded
8. Retirement ID assigned (sequential, per user)

### 7.3 Default Rates

| Rate | Default | Meaning |
|---|---|---|
| energyRate | 1e18 (1:1) | 1 dCARBON retired = 1 dENERGY minted |
| dluzRewardRate | 10e18 (10:1) | 1 dCARBON retired = 10 DLUZ reward |

### 7.4 Rate Caps (Security)

| Parameter | Max Value |
|---|---|
| energyRate | 100e18 (100:1) |
| dluzRewardRate | 1000e18 (1000:1) |
| reason length | 280 characters |

### 7.5 Pagination

Retirements are queryable via getRetirements(user, offset, limit) for gas-efficient frontend pagination.

### 7.6 Retirement Dashboard

The frontend includes:

- Protocol-wide stats: total retired, total retirements, dLuz distributed, dENERGY minted
- User stats: personal retirement history, rewards earned
- Full history table: date, wallet, amount, reason, transaction link
- Filter by "Mine" or "All"

---

## 8. DLuz Sale

A direct token sale contract for acquiring dLuz with ETH.

| Parameter | Value |
|---|---|
| Contract | DLuzSale (0xc6a59D50BE58FA91b430b3a6baA3a51Dc1194d35) |
| Payment | ETH |
| Rate | Fixed (set by owner) |
| Mechanism | Send ETH, receive dLuz instantly |
| Pausable | Yes (owner can pause/unpause) |

Features:

- No slippage — fixed rate guaranteed
- No KYC required — permissionless
- Instant delivery — tokens sent in same transaction
- Transparent — total sold, total raised, available supply readable on-chain

---

## 9. DEX and Liquidity

The protocol includes a native DEX (DLuzDEX at 0xc9284747A7DC88C08CD7A8051c262a101F24E6f3) for seamless trading of environmental tokens.

### 9.1 Available Pairs

| Pair | Description |
|---|---|
| dLuz / dCARBON | Trade governance token for carbon credits |
| dLuz / dENERGY | Trade governance token for energy certificates |
| dCARBON / dENERGY | Direct swap between environmental assets |

### 9.2 Pool Mechanics

- AMM model: Constant product (x * y = k)
- Swap fee: 0.3% per trade
- Fee split: 0.25% to LPs, 0.05% to Treasury
- No KYC: connect wallet and trade

### 9.3 Liquidity Provision

- LPs deposit token pairs and receive LP tokens
- LP tokens represent proportional pool ownership
- Fees are auto-compounded into pool reserves
- LPs can stake LP tokens in Farming for additional dLuz rewards

---

## 10. Farming and Rewards

The DLuzFarming contract (0x2ef3BFE8C997e031fff8992658C2Ac653b29b30a) incentivizes long-term participation.

### 10.1 Active Pools

| Pool | Stake | Earn | Status |
|---|---|---|---|
| Pool 0 | DLUZ | dCARBON | Active |
| Pool 1 | DLUZ | dENERGY | Active |

### 10.2 Mechanics

- Reward per second: configurable per pool by owner
- APY: dynamic, based on total staked value
- Claim: users call collect() to harvest pending rewards
- Unstake: withdraw staked dLuz at any time (no lock)

### 10.3 Reward Schedule

- Rewards emitted from Treasury allocation (400M dLuz)
- Halving every 6 months to maintain long-term sustainability
- APY adjusts dynamically based on total staked value

### 10.4 Retirement Rewards (via CarbonRegistry)

| Action | Reward |
|---|---|
| Retire 1 dCARBON | 10 dLuz + 1 dENERGY |
| Retire 100 dCARBON | 1,000 dLuz + 100 dENERGY |

Rates are adjustable by governance within security caps.

---

## 11. Tokenomics

### 11.1 DLUZ Distribution (1,000,000,000 total)

| Allocation | Amount | Percent | Vesting |
|---|---|---|---|
| Treasury (Retire rewards + LP incentives) | 400,000,000 | 40% | Programmatic release |
| Pre-Sale (DLuzSale contract) | 150,000,000 | 15% | Available at launch |
| Team and Founders | 100,000,000 | 10% | 12-month cliff, 36-month linear |
| Ecosystem and Partnerships | 150,000,000 | 15% | Milestone-based |
| Community (Farming, Airdrops) | 100,000,000 | 10% | Halving schedule |
| DEX Liquidity Pools | 100,000,000 | 10% | At launch |

### 11.2 Deflationary Pressure

DLUZ has a hard cap of 1 billion. Supply decreases over time through:

- **Retire fee burn** — 2% of each dCARBON retirement is routed to Treasury, converted to DLUZ, and burned.
- **Voluntary burn** — any holder can burn DLUZ at any time.
- **Reward halving** — dluzRewardRate decreases as adoption grows, reducing emission.

### 11.3 dCARBON and dENERGY Supply

Both are demand-driven. No cap, no pre-mine.

- dCARBON: minted only when BCT is deposited into CarbonBridge (1:1 backed)
- dENERGY: minted only as output of retirement events via CarbonRegistry

This ensures tokens are always backed by verified environmental assets.

---

## 12. Governance Roadmap

### Phase 1 — Foundation (Current)

- Model: Centralized deployer
- Who: dLuz Protocol founder
- Powers: Mint dCARBON, set rates, pause contracts, manage treasury
- Timeline: Launch to Month 6

### Phase 2 — Council

- Model: Semi-decentralized
- Who: Accredited verifiers (Verra, Gold Standard, local registries) + Foundation
- Powers: Verifiers mint dCARBON independently via oracle integration
- Governance: DLUZ holders vote on verifier inclusion/removal
- Timeline: Month 6 to Month 12

### Phase 3 — DAO

- Model: Fully decentralized
- Who: DLUZ token holders
- Powers: All protocol parameters, treasury allocation, upgrades
- Mechanism: Governor contract (OpenZeppelin Governor + Timelock)
- Timeline: Month 12+

---

## 13. Revenue Model

| Source | Fee | Destination |
|---|---|---|
| DEX swap | 0.30% | 0.25% to LPs, 0.05% to Treasury |
| dCARBON retirement | 2.00% | Treasury, then DLUZ buyback and burn |
| dCARBON minting (verifier) | 1.00% | Treasury |
| Pre-sale | ETH raised | Treasury (development + liquidity) |

### Treasury Management

- Treasury controlled by deployer (Phase 1), then Timelock + Governor (Phase 3)
- Revenue funds: protocol development, audits, partnerships, liquidity
- Monthly transparency reports on-chain

---

## 14. Carbon Market Context

### 14.1 Global Market

The voluntary carbon market reached $2B in 2023 and is projected to hit $50B by 2030 (McKinsey, BloombergNEF). Key drivers:

- Corporate net-zero commitments (Apple, Microsoft, Google, Shell)
- Article 6 of the Paris Agreement enabling cross-border credit trading
- EU CBAM (Carbon Border Adjustment Mechanism) starting 2026
- Growing institutional demand for verified, traceable credits

### 14.2 Brazil and SBCE

Brazil enacted Law 15.042/2024 creating the SBCE (Sistema Brasileiro de Comercio de Emissoes):

| Phase | Timeline | Description |
|---|---|---|
| Phase 1 | 2025-2026 | MRV regulation and structuring |
| Phase 2 | 2027-2028 | Registry and reporting system operation |
| Phase 3 | 2029 | Compensation obligations begin |
| Phase 4 | 2030+ | Full secondary market with CBEs |
| Phase 5 | 2031+ | International integration (Paris Art. 6) |

Key parameters:

- Cap and Trade model for entities emitting more than 10K tCO2e/year
- Creates CBEs (Brazilian Emission Certificates) as tradeable units
- Projected price: R$50-150 per tCO2
- dLuz is positioned to bridge SBCE and DeFi when CBEs become tradeable

### 14.3 BCT Price Context

The BCT market price (~$0.08) reflects the oversupply in the crypto voluntary carbon market since 2022, when Toucan Protocol bridged millions of tonnes. This does not reflect the environmental or regulatory value of carbon credits.

As regulation tightens globally (EU ETS, SBCE, CORSIA), demand for verified on-chain credits will increase, creating significant upside for properly backed carbon tokens.

---

## 15. Technical Stack

| Layer | Technology |
|---|---|
| Blockchain | Base (Coinbase L2), Sepolia testnet |
| Smart Contracts | Solidity 0.8.28, OpenZeppelin v5 |
| Framework | Hardhat |
| Frontend | Next.js 16.1.6 (Turbopack), React 19 |
| Wallet | RainbowKit + wagmi + viem |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion |
| i18n | Custom LanguageContext (PT-BR / EN) with localStorage |
| Hosting | Vercel |
| Domain | dluz.cc |
| Repository | github.com/carloshenmes/dluz-protocol |

---

## 16. Security

### 16.1 Smart Contract Security

- OpenZeppelin v5 — battle-tested, audited base contracts
- AccessControl — role-based permissions (MINTER_ROLE, DEFAULT_ADMIN_ROLE)
- Pausable — emergency stop on CarbonRegistry
- Rate caps — prevent misconfiguration (max 100:1 energy, 1000:1 DLUZ)
- Input validation — zero-amount, empty-reason, zero-address checks
- No proxy/upgradeable — immutable contracts, no admin rug vector

### 16.2 CarbonBridge Security

- BCT only accepted via isAcceptedToken() whitelist
- dCARBON minting is atomic with BCT lock (no partial state)
- Backing ratio always >= 100% (mathematically enforced)
- getBackingBalance() is public and view-only for anyone to audit

### 16.3 Operational Security

- Deployer keys in hardware wallet
- All contracts verified on BaseScan
- Bug bounty program active (critical: up to $50,000 in dLuz)
- Open source codebase on GitHub

### 16.4 Test Coverage

- 76 tests covering all contracts
- Branch coverage for edge cases (zero rates, truncation, failed transfers)
- Security-specific test suite (pausable, rate caps, reason length)

### 16.5 Audit Plan

| Phase | Scope | Target |
|---|---|---|
| Pre-launch | Core contracts (3 tokens + Registry + Bridge) | Q1 2026 |
| Post-DEX | DEX Router, Factory, Pools | Q2 2026 |
| Annual | Full protocol | Ongoing |

---

## 17. Roadmap

| Quarter | Milestone | Status |
|---|---|---|
| Q1 2026 | Testnet deploy (Base Sepolia). 9 contracts deployed and verified. Landing page, CarbonBridge, Farm, Sale, Retire, Blog, Bug Bounty pages live. i18n PT/EN. | Done |
| Q2 2026 | Mainnet launch (Base). DEX live with liquidity. First dCARBON minting from verified REDD+ project. Token launch via launchpad. | Next |
| Q3 2026 | Farming pools expanded. Oracle integration for external verifiers. Mobile-optimized UI. Subgraph deployment. | Planned |
| Q4 2026 | DAO governance via Governor + Timelock. Cross-chain bridge (Arbitrum, Polygon). | Planned |
| 2027 | Institutional API. RWA marketplace. Carbon credit futures. SBCE integration readiness. | Planned |

---

## 18. Legal Disclaimer

dLuz Protocol tokens (DLUZ, dCARBON, dENERGY) are utility tokens. They do not represent securities, equity, debt, or ownership in any entity.

- dCARBON represents a claim on a verified carbon credit retirement, not the credit itself.
- dENERGY represents a claim on a verified REC, not the certificate itself.
- DLUZ is a governance and utility token with no promise of financial return.

Users are responsible for compliance with local regulations. dLuz Protocol does not provide financial, legal, or tax advice.

---

## 19. References

1. McKinsey and Company. "A blueprint for scaling voluntary carbon markets." 2023.
2. BloombergNEF. "Long-Term Carbon Offsets Outlook." 2024.
3. Toucan Protocol. "BCT — Base Carbon Tonne." https://toucan.earth
4. KlimaDAO. "State of Digital Carbon." https://klimadao.finance
5. Verra. "Verified Carbon Standard (VCS)." https://verra.org
6. Gold Standard. "Gold Standard for the Global Goals." https://goldstandard.org
7. Brasil. Lei 15.042/2024. Sistema Brasileiro de Comercio de Emissoes (SBCE).
8. UNFCCC. "Paris Agreement — Article 6." https://unfccc.int
9. OpenZeppelin. "Contracts v5." https://openzeppelin.com
10. Base. "Coinbase Layer 2." https://base.org

---

## Contact

- Website: https://dluz.cc
- GitHub: https://github.com/carloshenmes/dluz-protocol
- X (Twitter): https://x.com/dluzprotocol

---

dLuz Protocol — Tokenizing real environmental impact on-chain.
