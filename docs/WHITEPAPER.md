# dLuz Protocol — Whitepaper v1.0

> Tokenizing carbon credits and renewable energy certificates on Base (Ethereum L2).

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Problem Statement](#2-problem-statement)
3. [Solution](#3-solution)
4. [Protocol Architecture](#4-protocol-architecture)
5. [Tokens](#5-tokens)
6. [Core Mechanics](#6-core-mechanics)
7. [Tokenomics](#7-tokenomics)
8. [Governance Roadmap](#8-governance-roadmap)
9. [Revenue Model](#9-revenue-model)
10. [Security](#10-security)
11. [Roadmap](#11-roadmap)
12. [Legal Disclaimer](#12-legal-disclaimer)

---

## 1. Abstract

dLuz is a DeFi protocol built on **Base** (Ethereum L2) that bridges the voluntary carbon market and renewable energy certificates (RECs) to the blockchain. It enables transparent issuance, trading, retirement, and verification of environmental assets through three interconnected ERC-20 tokens: **DLUZ**, **dCARBON**, and **dENERGY**.

The protocol eliminates intermediaries, reduces fraud through on-chain traceability, and creates economic incentives for carbon offsetting via a burn-to-earn mechanism.

---

## 2. Problem Statement

The voluntary carbon credit market is projected to reach **$50B by 2030** (McKinsey, 2023). Yet it suffers from:

- **Double counting** — the same credit sold multiple times across registries.
- **Opacity** — buyers cannot independently verify credit origin or retirement.
- **High fees** — brokers and intermediaries capture 15-30% of value.
- **Fragmentation** — RECs and carbon credits live in disconnected systems.
- **No composability** — credits cannot interact with DeFi primitives (lending, LP, staking).

---

## 3. Solution

dLuz unifies carbon credits and RECs into a single on-chain protocol with:

| Feature | Mechanism |
|---|---|
| **Anti-double-counting** | Each credit is a unique mint tx on Base. Burn = permanent retirement. |
| **Full transparency** | All mints, transfers, retirements are public on-chain. |
| **Low fees** | 2% retire fee + 0.3% swap fee vs. 15-30% traditional. |
| **Unified system** | dCARBON (carbon) and dENERGY (RECs) in one protocol. |
| **DeFi composability** | Tokens work with any ERC-20 compatible protocol. |

---

## 4. Protocol Architecture

┌─────────────────────────────────────────────────────┐ │ dLuz Protocol │ ├──────────┬──────────┬──────────┬────────────────────┤ │ DLuzToken│DCarbonTkn│DEnergyTkn│ CarbonRegistry │ │ (ERC-20) │ (ERC-20) │ (ERC-20) │ (Core Logic) │ │ Governance│ Carbon │ RECs │ Retire / Mint │ │ + Utility│ Credits │ │ Rates / Treasury │ ├──────────┴──────────┴──────────┴────────────────────┤ │ Base (Ethereum L2) │ ├─────────────────────────────────────────────────────┤ │ Ethereum L1 (Settlement) │ └─────────────────────────────────────────────────────┘




### Smart Contracts

| Contract | Role | Standard |
|---|---|---|
| `DLuzToken` | Governance + utility + rewards | ERC-20, ERC-20Permit, Ownable |
| `DCarbonToken` | Tokenized carbon credits | ERC-20, AccessControl (MINTER_ROLE) |
| `DEnergyToken` | Tokenized RECs | ERC-20, AccessControl (MINTER_ROLE) |
| `CarbonRegistry` | Retirement logic, rate management, event logging | Ownable, Pausable |

All contracts use **OpenZeppelin v5** audited libraries. Compiled with Solidity 0.8.28, EVM target Paris.

---

## 5. Tokens

### 5.1 DLUZ — Governance & Utility

| Property | Value |
|---|---|
| Name | dLuz Token |
| Symbol | DLUZ |
| Max Supply | 100,000,000 (100M) |
| Initial Mint | 10,000,000 (10M) to deployer |
| Mintable | Yes, by owner, up to max supply |
| Burnable | Yes, by any holder |
| Permit | ERC-2612 (gasless approvals) |

**Use cases:**
- Retirement rewards (burn dCARBON → earn DLUZ)
- DEX liquidity provision
- Farming rewards
- Future governance voting

### 5.2 dCARBON — Carbon Credits

| Property | Value |
|---|---|
| Name | dCarbon Token |
| Symbol | dCARBON |
| Max Supply | Uncapped (mint on demand) |
| Mintable | MINTER_ROLE only |
| Burnable | By holder (retire) or via CarbonRegistry |
| Peg | 1 dCARBON = 1 tCO₂e compensated |

**Lifecycle:**
1. Verified project submits credits to dLuz Foundation
2. Foundation validates against registry (Verra, Gold Standard)
3. MINTER_ROLE mints dCARBON 1:1
4. User trades, holds, or retires (burns)
5. Burn is permanent and irreversible

### 5.3 dENERGY — Renewable Energy Certificates

| Property | Value |
|---|---|
| Name | dEnergy Token |
| Symbol | dENERGY |
| Max Supply | Uncapped (mint on demand) |
| Mintable | MINTER_ROLE only |
| Burnable | By holder (redeem) |
| Peg | 1 dENERGY = 1 MWh renewable energy generated |

**Generation:**
- Minted automatically when dCARBON is retired via CarbonRegistry
- Rate configurable by owner (default: 1:1)

---

## 6. Core Mechanics

### 6.1 Retirement Flow

User calls CarbonRegistry.retire(amount, reason) │ ├─► Validates: amount > 0, reason not empty, balance sufficient │ ├─► Burns dCARBON from caller │ ├─► Mints dENERGY to caller (amount × energyRate / 1e18) │ └─► Skipped if energyRate = 0 or result truncates to 0 │ ├─► Transfers DLUZ from Treasury to caller (amount × dluzRewardRate / 1e18) │ └─► Skipped if dluzRewardRate = 0 or result truncates to 0 │ ├─► Records retirement on-chain (who, amount, reason, timestamp) │ ├─► Emits: CarbonRetired, EnergyMinted, DluzRewarded │ └─► Retirement ID assigned (sequential, per user)




### 6.2 Default Rates

| Rate | Default | Meaning |
|---|---|---|
| `energyRate` | 1e18 (1:1) | 1 dCARBON retired → 1 dENERGY minted |
| `dluzRewardRate` | 10e18 (10:1) | 1 dCARBON retired → 10 DLUZ reward |

### 6.3 Rate Caps (Security)

| Parameter | Max Value |
|---|---|
| `energyRate` | 100e18 (100:1) |
| `dluzRewardRate` | 1000e18 (1000:1) |
| `reason length` | 280 characters |

### 6.4 Pagination

Retirements are queryable via `getRetirements(user, offset, limit)` for gas-efficient frontend pagination.

---

## 7. Tokenomics

### 7.1 DLUZ Distribution

| Allocation | Amount | % | Vesting |
|---|---|---|---|
| Treasury (Retire rewards + LP incentives) | 40,000,000 | 40% | Programmatic release |
| Team & Founders | 15,000,000 | 15% | 12-month cliff, 36-month linear |
| Ecosystem & Partnerships | 20,000,000 | 20% | Milestone-based |
| Community (Farming, Airdrops) | 15,000,000 | 15% | Halving schedule |
| Liquidity (DEX pools) | 10,000,000 | 10% | At launch |

### 7.2 Deflationary Pressure

DLUZ has a hard cap of 100M. Supply decreases over time through:

1. **Retire fee burn** — 2% of each dCARBON retirement is routed to Treasury, converted to DLUZ, and burned.
2. **Voluntary burn** — any holder can burn DLUZ at any time.
3. **Reward halving** — dluzRewardRate decreases as adoption grows, reducing emission.

### 7.3 dCARBON & dENERGY Supply

Both are **demand-driven**. No cap, no pre-mine.

- dCARBON: minted only when real-world credits are verified and registered.
- dENERGY: minted only as output of retirement events.

This ensures tokens are always backed by verified environmental assets.

---

## 8. Governance Roadmap

### Phase 1 — Foundation (Current)

- **Model:** Centralized multisig (3-of-5)
- **Who:** dLuz Foundation core team
- **Powers:** Mint dCARBON, set rates, pause contracts, manage treasury
- **Timeline:** Launch → Month 6

### Phase 2 — Council

- **Model:** Semi-decentralized
- **Who:** Accredited verifiers (Verra, Gold Standard, local registries) + Foundation
- **Powers:** Verifiers can mint dCARBON independently via oracle integration
- **Governance:** DLUZ holders vote on verifier inclusion/removal
- **Timeline:** Month 6 → Month 12

### Phase 3 — DAO

- **Model:** Fully decentralized
- **Who:** DLUZ token holders
- **Powers:** All protocol parameters, treasury allocation, upgrades
- **Mechanism:** Governor contract (OpenZeppelin Governor + Timelock)
- **Timeline:** Month 12+

---

## 9. Revenue Model

| Source | Fee | Destination |
|---|---|---|
| DEX swap | 0.30% | 0.25% to LPs, 0.05% to Treasury |
| dCARBON retirement | 2.00% | Treasury → DLUZ buyback & burn |
| dCARBON minting (verifier) | 1.00% | Treasury |

### Treasury Management

- Treasury is a multisig (Phase 1) → Timelock + Governor (Phase 3)
- Revenue funds: protocol development, audits, partnerships, liquidity
- Monthly transparency reports on-chain

---

## 10. Security

### 10.1 Smart Contract Security

- **OpenZeppelin v5** — battle-tested, audited base contracts
- **AccessControl** — role-based permissions (MINTER_ROLE, DEFAULT_ADMIN_ROLE)
- **Pausable** — emergency stop on CarbonRegistry
- **Rate caps** — prevent misconfiguration (max 100:1 energy, 1000:1 DLUZ)
- **Input validation** — zero-amount, empty-reason, zero-address checks
- **No proxy/upgradeable** — immutable contracts, no admin rug vector

### 10.2 Operational Security

- Deployer keys in hardware wallet
- Multisig for treasury operations
- Bug bounty program (critical: up to $50,000)

### 10.3 Test Coverage

- 76 tests covering all contracts
- Branch coverage for edge cases (zero rates, truncation, failed transfers)
- Security-specific test suite (pausable, rate caps, reason length)

### 10.4 Audit Plan

| Phase | Scope | Target |
|---|---|---|
| Pre-launch | Core contracts (3 tokens + Registry) | Q1 2026 |
| Post-DEX | DEX Router, Factory, Pools | Q2 2026 |
| Annual | Full protocol | Ongoing |

---

## 11. Roadmap

| Quarter | Milestone |
|---|---|
| **Q1 2026** | Testnet deploy (Base Sepolia). Core contracts audited. Landing page live. |
| **Q2 2026** | Mainnet launch. DEX live. First dCARBON minting from verified project. |
| **Q3 2026** | Farming pools. Oracle integration for verifiers. Mobile app. |
| **Q4 2026** | DAO governance. Cross-chain bridge (Arbitrum, Polygon). |
| **2027** | Institutional API. RWA marketplace. Carbon credit futures. |

---

## 12. Legal Disclaimer

dLuz Protocol tokens (DLUZ, dCARBON, dENERGY) are **utility tokens**. They do not represent securities, equity, debt, or ownership in any entity.

- dCARBON represents a claim on a verified carbon credit retirement, not the credit itself.
- dENERGY represents a claim on a verified REC, not the certificate itself.
- DLUZ is a governance and utility token with no promise of financial return.

Users are responsible for compliance with local regulations. dLuz Foundation does not provide financial, legal, or tax advice.

---

## Contact

- **Website:** [dluz.io](https://dluz.io)
- **GitHub:** [github.com/dluz-protocol](https://github.com/dluz-protocol)
- **X (Twitter):** [@dluz_protocol](https://x.com/dluz_protocol)

---

*dLuz Protocol — Whitepaper v1.0 — February 2026*
*© 2026 dLuz Foundation. All rights reserved.*
