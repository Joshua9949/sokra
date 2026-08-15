# Sokra

## GenLayer contract

Sokra credentials are minted through a GenLayer intelligent contract. The
contract independently evaluates the learner's conversation, reaches a
consensus score, and stores the credential record onchain.

- Network: GenLayer StudioNet
- Contract: `0x840833f8990304C589AB11255aBFc282Aaf4AfeA`
- Deployment transaction: `0x3fab55ce58e740e393ad4212ecd5070f46cfe61c23b87f9420f8a9df6b3c79ce`
- Live mint transaction: `0x8ffa545763e8a0517023c4ba26dd509e7f91d4025e6b9678d899df928d9e8516`
- Live result: token `SKR-0000000000`, score `95/100`, descriptor `deep synthesis`

The contract source is in [`contracts/sokra_credential.py`](contracts/sokra_credential.py).
It uses a comparative equivalence principle for the validator score, rejects
scores below `70`, prevents duplicate credentials, and restricts minting to
the Sokra operator.

## What Sokra does

Sokra is an autonomous Socratic tutor. It guides a learner through a subject,
captures the explanation that demonstrates understanding, and turns that
evidence into a soulbound credential.

The existing React interface remains unchanged. The server now passes the
candidate evidence and conversation history to GenLayer, waits for finality,
reads the committed credential back, and stores the returned transaction hash,
contract address, token ID, score, and descriptor in Supabase.

## Local development

```sh
bun install
bun run dev
```

The server-side GenLayer configuration is documented in [`.env.example`](.env.example):

```sh
GENLAYER_PRIVATE_KEY=0x...
SOKRA_CREDENTIAL_CONTRACT_ADDRESS=0x840833f8990304C589AB11255aBFc282Aaf4AfeA
GENLAYER_RPC_URL=https://studio.genlayer.com/api
```

`GENLAYER_PRIVATE_KEY` must belong to the operator account that deployed the
contract. Keep it server-side and never expose it to the browser.

## Checks

```sh
uv run --with genlayer-test==0.29.2 --with pytest pytest tests/direct/test_sokra_credential.py -v
genvm-lint lint contracts/sokra_credential.py --json
bunx tsc --noEmit
bun run build
```

The direct test suite covers successful consensus scoring, threshold rejection,
duplicate protection, and operator-only minting.
