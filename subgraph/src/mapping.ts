import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { CarbonRetired } from "../generated/CarbonRegistry/CarbonRegistry";
import { Retirement, UserStats, ProtocolStats } from "../generated/schema";

const DLUZ_RATE = BigInt.fromI32(10);
const DENERGY_RATE = BigInt.fromI32(1);
const PROTOCOL_ID = Bytes.fromHexString("0x01");

export function handleCarbonRetired(event: CarbonRetired): void {
  // 1. Create Retirement entity
  let retirement = new Retirement(event.transaction.hash);
  retirement.user = event.params.user;
  retirement.amount = event.params.amount;
  retirement.reason = event.params.reason;
  retirement.dluzReward = event.params.amount.times(DLUZ_RATE);
  retirement.denergyMinted = event.params.amount.times(DENERGY_RATE);
  retirement.blockNumber = event.block.number;
  retirement.blockTimestamp = event.block.timestamp;
  retirement.transactionHash = event.transaction.hash;
  retirement.save();

  // 2. Update UserStats
  let userId = event.params.user;
  let userStats = UserStats.load(userId);
  if (!userStats) {
    userStats = new UserStats(userId);
    userStats.totalRetired = BigInt.fromI32(0);
    userStats.totalDluzEarned = BigInt.fromI32(0);
    userStats.totalDenergyEarned = BigInt.fromI32(0);
    userStats.retirementCount = BigInt.fromI32(0);
  }
  userStats.totalRetired = userStats.totalRetired.plus(event.params.amount);
  userStats.totalDluzEarned = userStats.totalDluzEarned.plus(event.params.amount.times(DLUZ_RATE));
  userStats.totalDenergyEarned = userStats.totalDenergyEarned.plus(event.params.amount.times(DENERGY_RATE));
  userStats.retirementCount = userStats.retirementCount.plus(BigInt.fromI32(1));
  userStats.save();

  // 3. Update ProtocolStats (singleton)
  let protocol = ProtocolStats.load(PROTOCOL_ID);
  if (!protocol) {
    protocol = new ProtocolStats(PROTOCOL_ID);
    protocol.totalCarbonRetired = BigInt.fromI32(0);
    protocol.totalDluzDistributed = BigInt.fromI32(0);
    protocol.totalDenergyMinted = BigInt.fromI32(0);
    protocol.totalRetirements = BigInt.fromI32(0);
  }
  protocol.totalCarbonRetired = protocol.totalCarbonRetired.plus(event.params.amount);
  protocol.totalDluzDistributed = protocol.totalDluzDistributed.plus(event.params.amount.times(DLUZ_RATE));
  protocol.totalDenergyMinted = protocol.totalDenergyMinted.plus(event.params.amount.times(DENERGY_RATE));
  protocol.totalRetirements = protocol.totalRetirements.plus(BigInt.fromI32(1));
  protocol.save();
}
