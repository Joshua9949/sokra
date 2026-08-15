import { createAccount, createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";

const DEFAULT_RPC_URL = studionet.rpcUrls.default.http[0];

export type MintCredentialInput = {
  credentialId: string;
  wallet: string;
  subject: string;
  name: string;
  area: string;
  excerpt: string;
  insight: string;
  conversation: string;
};

export type MintCredentialResult = {
  transactionHash: string;
  contractAddress: string;
  tokenId: string;
  qualityScore: number;
  qualityDescriptor: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`GenLayer configuration is missing ${name}`);
  return value;
}

function addressEnv(name: string): `0x${string}` {
  const value = requiredEnv(name);
  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
    throw new Error(`${name} must be a 20-byte hexadecimal address`);
  }
  return value as `0x${string}`;
}

function privateKeyEnv(): `0x${string}` {
  const value = requiredEnv("GENLAYER_PRIVATE_KEY");
  if (!/^0x[a-fA-F0-9]{64}$/.test(value)) {
    throw new Error("GENLAYER_PRIVATE_KEY must be a 32-byte hexadecimal private key");
  }
  return value as `0x${string}`;
}

function positiveIntegerEnv(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
}

function createGenLayer() {
  const account = createAccount(privateKeyEnv());
  const client = createClient({
    chain: studionet,
    endpoint: process.env["GENLAYER_RPC_URL"]?.trim() || DEFAULT_RPC_URL,
    account,
  });
  return { client, contractAddress: addressEnv("SOKRA_CREDENTIAL_CONTRACT_ADDRESS") };
}

function objectResult(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("GenLayer returned an invalid credential record");
  }
  return value as Record<string, unknown>;
}

function requiredString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`GenLayer returned an invalid ${key}`);
  }
  return value;
}

function requiredScore(record: Record<string, unknown>): number {
  const value = record.quality_score;
  const score = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(score) || score < 1 || score > 100) {
    throw new Error("GenLayer returned an invalid quality score");
  }
  return score;
}

export async function mintCredentialOnGenLayer(
  input: MintCredentialInput,
): Promise<MintCredentialResult> {
  const { client, contractAddress } = createGenLayer();
  const holder = addressEnvValue(input.wallet, "wallet");

  const transactionHash = await client.writeContract({
    address: contractAddress,
    functionName: "mint_credential",
    args: [
      input.credentialId,
      holder,
      input.subject,
      input.name,
      input.area,
      input.excerpt,
      input.insight,
      input.conversation,
    ],
    value: 0n,
    leaderOnly: false,
  });

  const receipt = await client.waitForTransactionReceipt({
    hash: transactionHash,
    status: TransactionStatus.FINALIZED,
    retries: positiveIntegerEnv("GENLAYER_TX_RETRIES", 40),
    interval: positiveIntegerEnv("GENLAYER_TX_INTERVAL_MS", 3000),
  });

  if (receipt.txExecutionResultName && receipt.txExecutionResultName !== "FINISHED_WITH_RETURN") {
    const executionError = receipt.consensus_data?.leader_receipt?.find(
      (leaderReceipt) => leaderReceipt.error,
    )?.error;
    throw new Error(executionError || `GenLayer mint failed (${receipt.txExecutionResultName})`);
  }

  const rawRecord = await client.readContract({
    address: contractAddress,
    functionName: "get_credential",
    args: [input.credentialId],
    jsonSafeReturn: true,
  });
  const record = objectResult(rawRecord);

  return {
    transactionHash: String(transactionHash),
    contractAddress,
    tokenId: requiredString(record, "token_id"),
    qualityScore: requiredScore(record),
    qualityDescriptor: requiredString(record, "quality_descriptor"),
  };
}

function addressEnvValue(value: string, label: string): `0x${string}` {
  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
    throw new Error(`${label} must be a 20-byte hexadecimal address`);
  }
  return value as `0x${string}`;
}
