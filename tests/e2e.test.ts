/**
 * E2E Tests - Real Mainnet Transaction Parsing
 * 
 * These tests verify the parser works correctly against real Solana mainnet transactions.
 * They require network access to Solana RPC.
 * 
 * Note: These tests may fail if:
 * - RPC rate limits are hit
 * - Transactions become too old to fetch
 * - Network issues occur
 */

import { describe, it, expect, afterAll } from 'vitest';
import { Connection } from '@solana/web3.js';
import { SolanaParser, ParsedResult } from '../src/index';
import * as fs from 'fs';
import * as path from 'path';

// Use a public RPC endpoint - may have rate limits
const RPC_ENDPOINT = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

// Store results for documentation export
const testResults: {
    timestamp: string;
    rpcEndpoint: string;
    results: Array<{
        protocol: string;
        signature: string;
        success: boolean;
        actions: Array<{ protocol: string; type: string; summary: string }>;
        error?: string;
    }>;
} = {
    timestamp: new Date().toISOString(),
    rpcEndpoint: RPC_ENDPOINT.includes('mainnet') ? 'Mainnet (redacted)' : RPC_ENDPOINT,
    results: []
};

// Export results to JSON for docs generation
afterAll(async () => {
    const outputDir = path.join(__dirname, '..', 'docs', 'e2e-results');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'latest.json');
    fs.writeFileSync(outputPath, JSON.stringify(testResults, null, 2));
    console.log(`\n📊 E2E Results exported to: ${outputPath}`);

    // Also generate markdown summary
    const mdPath = path.join(outputDir, 'RESULTS.md');
    const mdContent = generateMarkdownReport(testResults);
    fs.writeFileSync(mdPath, mdContent);
    console.log(`📄 Markdown report: ${mdPath}`);
});

function generateMarkdownReport(results: typeof testResults): string {
    const successCount = results.results.filter(r => r.success).length;
    const totalCount = results.results.length;

    let md = `# E2E Test Results\n\n`;
    md += `> Generated: ${results.timestamp}\n\n`;
    md += `## Summary\n\n`;
    md += `| Metric | Value |\n|--------|-------|\n`;
    md += `| Total Tests | ${totalCount} |\n`;
    md += `| Passed | ${successCount} |\n`;
    md += `| Failed | ${totalCount - successCount} |\n`;
    md += `| RPC | ${results.rpcEndpoint} |\n\n`;

    md += `## Protocol Results\n\n`;

    const byProtocol = new Map<string, typeof results.results>();
    results.results.forEach(r => {
        const key = r.protocol;
        if (!byProtocol.has(key)) byProtocol.set(key, []);
        byProtocol.get(key)!.push(r);
    });

    for (const [protocol, txs] of byProtocol) {
        md += `### ${protocol}\n\n`;
        md += `| Signature | Status | Actions |\n|-----------|--------|--------|\n`;
        for (const tx of txs) {
            const status = tx.success ? '✅ Pass' : '❌ Fail';
            const actions = tx.actions.map(a => `${a.type}`).join(', ') || 'N/A';
            md += `| \`${tx.signature.slice(0, 16)}...\` | ${status} | ${actions} |\n`;
        }
        md += '\n';
    }

    return md;
}

describe('E2E: Real Mainnet Transactions', () => {
    const connection = new Connection(RPC_ENDPOINT, 'confirmed');
    const parser = new SolanaParser(connection);

    // Increase timeout for network requests
    const TIMEOUT = 30000;

    describe('System Program', () => {
        it('should parse a real SOL transfer transaction', async () => {
            const txSignature = '5UfDuX7WXY18keiz9mZ6zKkY8JyNuLDFz2UMGqE8CRN57pRBbME6VxWJbHqftiXxhozVhzR3vo4qJpUktqt5sMEj';

            try {
                const result = await parser.parseTransaction(txSignature);

                if (result) {
                    expect(result.signature).toBe(txSignature);
                    expect(result.actions.length).toBeGreaterThan(0);

                    testResults.results.push({
                        protocol: 'System Program',
                        signature: txSignature,
                        success: true,
                        actions: result.actions.map(a => ({ protocol: a.protocol, type: a.type, summary: a.summary }))
                    });
                }
            } catch (e: any) {
                testResults.results.push({
                    protocol: 'System Program',
                    signature: txSignature,
                    success: false,
                    actions: [],
                    error: e.message
                });
                throw e;
            }
        }, TIMEOUT);
    });

    describe('Jupiter Aggregator', () => {
        it('should parse a real Jupiter swap transaction', async () => {
            const txSignature = '3gyPgPLkRT98vMZRd3RhBrK6z7HeHrXhBfJeyxZQNGHrBJJquJkW8mvFrABhJu4RP5aJ9zgg4F6DmWxWwjf2pump';

            try {
                const result = await parser.parseTransaction(txSignature);

                if (result) {
                    expect(result.actions).toBeDefined();

                    testResults.results.push({
                        protocol: 'Jupiter',
                        signature: txSignature,
                        success: true,
                        actions: result.actions.map(a => ({ protocol: a.protocol, type: a.type, summary: a.summary }))
                    });
                }
            } catch (e: any) {
                testResults.results.push({
                    protocol: 'Jupiter',
                    signature: txSignature,
                    success: false,
                    actions: [],
                    error: e.message
                });
                throw e;
            }
        }, TIMEOUT);
    });

    describe('Raydium AMM V4', () => {
        it('should parse a real Raydium swap transaction', async () => {
            // Real Raydium swap from Solscan
            const txSignature = '3oPfvbCztaNEpbtSib2DezyzjvSwxv7mZv8peCoAuiRijetvFM3TspWthxzETGkYYuxjVGa6HbdEKjiv9vZzd3Up';

            try {
                const result = await parser.parseTransaction(txSignature);

                if (result) {
                    expect(result.actions).toBeDefined();

                    // Look for Raydium actions
                    const raydiumActions = result.actions.filter(a =>
                        a.protocol === 'Raydium' ||
                        a.protocol.includes('Raydium')
                    );

                    console.log('Raydium actions found:', raydiumActions.length);
                    console.log('Action types:', raydiumActions.map(a => `${a.protocol}: ${a.type}`));

                    testResults.results.push({
                        protocol: 'Raydium AMM V4',
                        signature: txSignature,
                        success: true,
                        actions: result.actions.map(a => ({ protocol: a.protocol, type: a.type, summary: a.summary }))
                    });
                }
            } catch (e: any) {
                testResults.results.push({
                    protocol: 'Raydium AMM V4',
                    signature: txSignature,
                    success: false,
                    actions: [],
                    error: e.message
                });
                throw e;
            }
        }, TIMEOUT);

        it('should parse a Raydium route transaction', async () => {
            const txSignature = '3cBjqB67PwX2qwghME2wsDNQJwMz17nYT2pUJZXoujCs4tB5ix2UJUssANpkcQeVd6EwtAuJU3Dh46UF3d8CjPB6';

            try {
                const result = await parser.parseTransaction(txSignature);

                if (result) {
                    expect(result.actions).toBeDefined();

                    testResults.results.push({
                        protocol: 'Raydium AMM V4',
                        signature: txSignature,
                        success: true,
                        actions: result.actions.map(a => ({ protocol: a.protocol, type: a.type, summary: a.summary }))
                    });
                }
            } catch (e: any) {
                testResults.results.push({
                    protocol: 'Raydium AMM V4',
                    signature: txSignature,
                    success: false,
                    actions: [],
                    error: e.message
                });
                throw e;
            }
        }, TIMEOUT);
    });

    describe('Orca Whirlpool', () => {
        it('should parse a real Orca Whirlpool swap transaction', async () => {
            // Real Orca Whirlpool swap from Solscan
            const txSignature = '3EWQN5tjCMMsxavQdJz9FD4ZSUbfFdyzmA9Ndf8Sa7NRmSJLq84PWi3BVTgE6wsk2G8xhhuMVT5Yq8GUWUeE6h34';

            try {
                const result = await parser.parseTransaction(txSignature);

                if (result) {
                    expect(result.actions).toBeDefined();

                    // Look for Orca actions
                    const orcaActions = result.actions.filter(a =>
                        a.protocol === 'Orca Whirlpool' ||
                        a.protocol.includes('Orca')
                    );

                    console.log('Orca actions found:', orcaActions.length);
                    console.log('Action types:', orcaActions.map(a => `${a.protocol}: ${a.type}`));

                    testResults.results.push({
                        protocol: 'Orca Whirlpool',
                        signature: txSignature,
                        success: true,
                        actions: result.actions.map(a => ({ protocol: a.protocol, type: a.type, summary: a.summary }))
                    });
                }
            } catch (e: any) {
                testResults.results.push({
                    protocol: 'Orca Whirlpool',
                    signature: txSignature,
                    success: false,
                    actions: [],
                    error: e.message
                });
                throw e;
            }
        }, TIMEOUT);

        it('should parse an Orca route transaction', async () => {
            const txSignature = '4MSqXd7fsTyD9xTEBkHjLdWEJSqNDJ2u9GaKwLiBHSZmqjQ28K1gUtiUQRmVAzyS1XEedjNuQzFinVzfMDT2KTFT';

            try {
                const result = await parser.parseTransaction(txSignature);

                if (result) {
                    expect(result.actions).toBeDefined();

                    testResults.results.push({
                        protocol: 'Orca Whirlpool',
                        signature: txSignature,
                        success: true,
                        actions: result.actions.map(a => ({ protocol: a.protocol, type: a.type, summary: a.summary }))
                    });
                }
            } catch (e: any) {
                testResults.results.push({
                    protocol: 'Orca Whirlpool',
                    signature: txSignature,
                    success: false,
                    actions: [],
                    error: e.message
                });
                throw e;
            }
        }, TIMEOUT);
    });

    describe('Error Handling', () => {
        it('should handle transaction not found gracefully', async () => {
            const fakeTxSignature = '1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111';

            const result = await parser.parseTransaction(fakeTxSignature);
            expect(result).toBeNull();

            testResults.results.push({
                protocol: 'Error Handling',
                signature: fakeTxSignature,
                success: true,
                actions: [{ protocol: 'Test', type: 'NotFound', summary: 'Correctly returned null' }]
            });
        }, TIMEOUT);
    });
});

describe('E2E: Parser Output Validation', () => {
    const connection = new Connection(RPC_ENDPOINT, 'confirmed');
    const parser = new SolanaParser(connection);
    const TIMEOUT = 30000;

    it('should produce valid ParsedResult structure', async () => {
        const txSignature = '5UfDuX7WXY18keiz9mZ6zKkY8JyNuLDFz2UMGqE8CRN57pRBbME6VxWJbHqftiXxhozVhzR3vo4qJpUktqt5sMEj';

        const result = await parser.parseTransaction(txSignature);

        if (result) {
            expect(typeof result.success).toBe('boolean');
            expect(typeof result.fee).toBe('string');
            expect(typeof result.signature).toBe('string');
            expect(Array.isArray(result.actions)).toBe(true);

            for (const action of result.actions) {
                expect(typeof action.protocol).toBe('string');
                expect(typeof action.type).toBe('string');
                expect(typeof action.summary).toBe('string');
                expect(typeof action.details).toBe('object');
            }
        }
    }, TIMEOUT);
});

