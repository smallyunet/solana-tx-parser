/**
 * Basic Example - Solana Transaction Decoder
 * 
 * This example demonstrates how to parse real Solana transactions
 * using the solana-tx-decoder library.
 */

import { Connection } from '@solana/web3.js';
import { SolanaParser } from '../src/index';

// Use environment variable or default to public RPC
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

// Real transaction signatures from mainnet
const EXAMPLE_TRANSACTIONS = {
    // Raydium AMM V4 Swap
    raydiumSwap: '3oPfvbCztaNEpbtSib2DezyzjvSwxv7mZv8peCoAuiRijetvFM3TspWthxzETGkYYuxjVGa6HbdEKjiv9vZzd3Up',
    // Orca Whirlpool Swap
    orcaSwap: '3EWQN5tjCMMsxavQdJz9FD4ZSUbfFdyzmA9Ndf8Sa7NRmSJLq84PWi3BVTgE6wsk2G8xhhuMVT5Yq8GUWUeE6h34',
    // Jupiter Aggregator Swap
    jupiterSwap: '3gyPgPLkRT98vMZRd3RhBrK6z7HeHrXhBfJeyxZQNGHrBJJquJkW8mvFrABhJu4RP5aJ9zgg4F6DmWxWwjf2pump',
};

async function main() {
    const connection = new Connection(RPC_URL, 'confirmed');
    const parser = new SolanaParser(connection);

    console.log('🚀 Solana Transaction Decoder - Basic Example\n');
    console.log(`Using RPC: ${RPC_URL.includes('mainnet') ? 'Mainnet' : RPC_URL}\n`);

    // Parse each example transaction
    for (const [name, txId] of Object.entries(EXAMPLE_TRANSACTIONS)) {
        console.log(`\n📦 Parsing ${name}...`);
        console.log(`   Signature: ${txId.slice(0, 20)}...`);

        try {
            const result = await parser.parseTransaction(txId);

            if (!result) {
                console.log('   ❌ Transaction not found');
                continue;
            }

            console.log(`   ✅ Success: ${result.success}`);
            console.log(`   💰 Fee: ${result.fee} SOL`);
            console.log(`   📋 Actions (${result.actions.length}):`);

            for (const action of result.actions) {
                console.log(`      - [${action.protocol}] ${action.type}: ${action.summary}`);
            }

        } catch (error: any) {
            if (error.message?.includes('403')) {
                console.log('   ⚠️  RPC blocked (403). Use a private RPC URL.');
            } else {
                console.log(`   ❌ Error: ${error.message}`);
            }
        }
    }

    console.log('\n✨ Done!\n');
}

// Run the example
// Usage: SOLANA_RPC_URL=https://your-rpc npx ts-node examples/basic.ts
if (require.main === module) {
    main().catch(console.error);
}

export { main };
