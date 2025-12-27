# Examples and Results

This document provides a showcase of how different Solana protocols are parsed into structured, human-readable data by `solana-tx-decoder`.

## 1. System Program (Transfer)

Standard SOL transfer between two accounts.

### Parsed Output
```json
{
  "protocol": "System",
  "type": "Transfer",
  "summary": "Transfer 1.5 SOL from 4vM... to 9vG...",
  "details": {
    "from": "4vMK39XJ... (Signer)",
    "to": "9vG1o... ",
    "amount": "1500000000"
  },
  "direction": "OUT"
}
```

---

## 2. SPL Token (TransferChecked)

Token transfer with mint and decimal validation.

### Parsed Output
```json
{
  "protocol": "SPL Token",
  "type": "TransferChecked",
  "summary": "Transfer 125.5 tokens",
  "details": {
    "source": "A6y5...",
    "mint": "EPjFWq6HL9agAt6EB9uBew8Be4nQucr6dq3Lmid36BLQ",
    "destination": "D8yR...",
    "owner": "4vMK...",
    "amount": "125500000",
    "decimals": 6
  }
}
```

---

## 3. Jupiter Aggregator (Swap)

Deep parsing of a Jupiter swap instruction, extracting quoted amounts.

### Parsed Output
```json
{
  "protocol": "Jupiter",
  "type": "Swap",
  "summary": "Jupiter Swap: 1000000000 -> 52430000 (Quoted)",
  "details": {
    "name": "swap",
    "data": {
      "inAmount": "1000000000",
      "quotedOutAmount": "52430000",
      "slippageBps": 50
    },
    "extractedAmounts": {
      "inAmount": "1000000000",
      "outAmount": "52430000"
    }
  }
}
```

---

## 4. Raydium (AMM Swap)

Parsing Raydium V4 SwapBaseIn instruction.

### Parsed Output
```json
{
  "protocol": "Raydium",
  "type": "Swap (BaseIn)",
  "summary": "Raydium Swap: 500000000 -> min 480000000",
  "details": {
    "amountIn": "500000000",
    "minAmountOut": "480000000"
  },
  "direction": "UNKNOWN"
}
```

---

## 5. Orca (Whirlpool Swap)

Detailed parsing of an Orca Whirlpool swap using Anchor IDL fallback.

### Parsed Output
```json
{
  "protocol": "Orca Whirlpool",
  "type": "swap",
  "summary": "Orca Swap: 200000000 (Input) -> min 198000000",
  "details": {
    "name": "swap",
    "data": {
      "amount": "200000000",
      "otherAmountThreshold": "198000000",
      "sqrtPriceLimit": "79228162514264337593543950336",
      "amountSpecifiedIsInput": true
    },
    "extractedAmounts": {
      "amount": "200000000",
      "otherAmountThreshold": "198000000",
      "amountSpecifiedIsInput": true
    }
  }
}
```
