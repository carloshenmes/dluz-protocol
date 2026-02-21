const SUBGRAPH_URL = process.env.NEXT_PUBLIC_SUBGRAPH_URL || "";

// ─── Types ───────────────────────────────────────────────────

export interface RetirementEntry {
  id: string;
  user: string;
  amount: string;
  reason: string;
  dluzReward: string;
  denergyMinted: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
}

export interface ProtocolStats {
  totalCarbonRetired: string;
  totalDluzDistributed: string;
  totalDenergyMinted: string;
  totalRetirements: string;
}

export interface UserStatsData {
  totalRetired: string;
  totalDluzEarned: string;
  totalDenergyEarned: string;
  retirementCount: string;
}

// ─── GraphQL helper ──────────────────────────────────────────

async function querySubgraph<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!SUBGRAPH_URL) {
    throw new Error("NEXT_PUBLIC_SUBGRAPH_URL not configured");
  }
  const res = await fetch(SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Subgraph error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message || "GraphQL error");
  return json.data;
}

// ─── Queries ─────────────────────────────────────────────────

export async function fetchRetirements(limit: number = 20): Promise<RetirementEntry[]> {
  const data = await querySubgraph<{ retirements: RetirementEntry[] }>(`
    query($limit: Int!) {
      retirements(first: $limit, orderBy: blockTimestamp, orderDirection: desc) {
        id
        user
        amount
        reason
        dluzReward
        denergyMinted
        blockNumber
        blockTimestamp
        transactionHash
      }
    }
  `, { limit });
  return data.retirements;
}

export async function fetchUserRetirements(address: string): Promise<RetirementEntry[]> {
  const data = await querySubgraph<{ retirements: RetirementEntry[] }>(`
    query($user: Bytes!) {
      retirements(
        where: { user: $user }
        orderBy: blockTimestamp
        orderDirection: desc
        first: 50
      ) {
        id
        user
        amount
        reason
        dluzReward
        denergyMinted
        blockNumber
        blockTimestamp
        transactionHash
      }
    }
  `, { user: address.toLowerCase() });
  return data.retirements;
}

export async function fetchProtocolStats(): Promise<ProtocolStats> {
  const data = await querySubgraph<{ protocolStats: ProtocolStats | null }>(`
    {
      protocolStats(id: "0x70726f746f636f6c") {
        totalCarbonRetired
        totalDluzDistributed
        totalDenergyMinted
        totalRetirements
      }
    }
  `);
  return data.protocolStats ?? {
    totalCarbonRetired: "0",
    totalDluzDistributed: "0",
    totalDenergyMinted: "0",
    totalRetirements: "0",
  };
}

export async function fetchUserStats(address: string): Promise<UserStatsData | null> {
  const data = await querySubgraph<{ userStats: UserStatsData | null }>(`
    query($id: Bytes!) {
      userStats(id: $id) {
        totalRetired
        totalDluzEarned
        totalDenergyEarned
        retirementCount
      }
    }
  `, { id: address.toLowerCase() });
  return data.userStats ?? null;
}
