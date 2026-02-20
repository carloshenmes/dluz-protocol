import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  CarbonRetired,
  DluzRewarded,
  EnergyMinted,
} from "../generated/CarbonRegistry/CarbonRegistry";
import { Retirement, UserStats, ProtocolStats } from "../generated/schema";

const PROTOCOL_ID = Bytes.fromHexString("0x01");

function getOrCreateUserStats(user: Bytes): UserStats {
  let stats = UserStats.load(user);
  if (!stats) {
    stats = new UserStats(user);
    stats.totalRetired = BigInt.fromI32(0);
    stats.totalDluzEarned = BigInt.fromI32(0);
    stats.totalDenergyEarned = BigInt.fromI32(0);
    stats.retirementCount = BigInt.fromI32(0);
  }
  return stats;
}

function getOrCreateProtocolStats(): ProtocolStats {
  let stats = ProtocolStats.load(PROTOCOL_ID);
  if (!stats) {
    stats = new ProtocolStats(PROTOCOL_ID);
    stats.totalCarbonRetired = BigInt.fromI32(0);
    stats.totalDluzDistributed = BigInt.fromI32(0);
    stats.totalDenergyMinted = BigInt.fromI32(0);
    stats.totalRetirements = BigInt.fromI32(0);
  }
  return stats;
}

export function handleCarbonRetired(event: CarbonRetired): void {
  let id = event.transaction.hash.concatI32(event.logIndex.toI32());

  let retirement = new Retirement(id);
  retirement.user = event.params.retiree;
  retirement.amount = event.params.amount;
  retirement.reason = event.params.reason;
  retirement.dluzReward = BigInt.fromI32(0);
  retirement.denergyMinted = BigInt.fromI32(0);
  retirement.blockNumber = event.block.number;
  retirement.blockTimestamp = event.block.timestamp;
  retirement.transactionHash = event.transaction.hash;
  retirement.save();

  let userStats = getOrCreateUserStats(changetype<Bytes>(event.params.retiree));
  userStats.totalRetired = userStats.totalRetired.plus(event.params.amount);
  userStats.retirementCount = userStats.retirementCount.plus(BigInt.fromI32(1));
  userStats.save();

  let protocol = getOrCreateProtocolStats();
  protocol.totalCarbonRetired = protocol.totalCarbonRetired.plus(event.params.amount);
  protocol.totalRetirements = protocol.totalRetirements.plus(BigInt.fromI32(1));
  protocol.save();
}

export function handleDluzRewarded(event: DluzRewarded): void {
  let userStats = getOrCreateUserStats(changetype<Bytes>(event.params.retiree));
  userStats.totalDluzEarned = userStats.totalDluzEarned.plus(event.params.amount);
  userStats.save();

  let protocol = getOrCreateProtocolStats();
  protocol.totalDluzDistributed = protocol.totalDluzDistributed.plus(event.params.amount);
  protocol.save();
}

export function handleEnergyMinted(event: EnergyMinted): void {
  let userStats = getOrCreateUserStats(changetype<Bytes>(event.params.retiree));
  userStats.totalDenergyEarned = userStats.totalDenergyEarned.plus(event.params.amount);
  userStats.save();

  let protocol = getOrCreateProtocolStats();
  protocol.totalDenergyMinted = protocol.totalDenergyMinted.plus(event.params.amount);
  protocol.save();
}
