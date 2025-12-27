
import { Connection } from '@solana/web3.js';
import { SolanaParser } from '../src/index';

// Initialize connection (mainnet-beta)
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
const parser = new SolanaParser(connection);

async function main() {
    // Example Transaction: Jupiter Swap
    const txId = '5mS18Q2i5P1Xk5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5k5';
    // Note: Replace with a real recent Jupiter TX ID for best results

    console.log(`Parsing transaction: ${txId}...`);

    try {
        const result = await parser.parseTransaction(txId);

        if (!result) {
            console.log('Transaction not found or failed to parse.');
            return;
        }

        console.log('--- Parsed Result ---');
        console.log('Signature:', result.signature);
        console.log('Fee:', result.fee, 'SOL');
        console.log('Timestamp:', result.timestamp);
        console.log('Actions:', JSON.stringify(result.actions, null, 2));

    } catch (error) {
        console.error('Error parsing transaction:', error);
    }
}

// To run this:
// npx ts-node examples/basic.ts
if (require.main === module) {
    main();
}
