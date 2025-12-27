import { Connection } from '@solana/web3.js';
import { SolanaParser } from '../../../src/index';

// Note: In a real Vite app, we would install the package via npm
// But here we import relatively for the demo to work with the local source.

// Polyfill Buffer for browser (needed for @solana/web3.js / anchor in some build envs)
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
const parser = new SolanaParser(connection);

const decodeBtn = document.getElementById('decodeBtn') as HTMLButtonElement;
const txInput = document.getElementById('txId') as HTMLInputElement;
const output = document.getElementById('output') as HTMLPreElement;
const loading = document.getElementById('loading') as HTMLDivElement;

decodeBtn.addEventListener('click', async () => {
    const txId = txInput.value.trim();
    if (!txId) return;

    output.textContent = '';
    loading.style.display = 'block';

    try {
        console.log(`Decoding ${txId}...`);
        const result = await parser.parseTransaction(txId);
        output.textContent = JSON.stringify(result, null, 2);
    } catch (e: any) {
        console.error(e);
        output.textContent = `Error: ${e.message}`;
    } finally {
        loading.style.display = 'none';
    }
});
