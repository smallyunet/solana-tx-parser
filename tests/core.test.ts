import { describe, it, expect, vi } from 'vitest';
import { PublicKey, Connection, VersionedTransactionResponse, Keypair } from '@solana/web3.js';
import { SolanaParser } from '../src/index';

describe('SolanaParser Core', () => {
    const connection = new Connection("https://api.mainnet-beta.solana.com");
    const parser = new SolanaParser(connection);

    it('should correctly resolve loadedAddresses in Versioned Transactions', async () => {
        const sysProgram = new PublicKey("11111111111111111111111111111111");
        // Use random valid keys
        const source = Keypair.generate().publicKey;
        const dest = Keypair.generate().publicKey; // In ALT

        // Create a mocked VersionedTransactionResponse
        // We simulate a System Transfer: source -> dest
        // programId: sysProgram (index 0)
        // accounts: [source (index 1), dest (index 2)]

        const mockTx: any = {
            transaction: {
                message: {
                    staticAccountKeys: [sysProgram, source],
                    compiledInstructions: [
                        {
                            programIdIndex: 0,
                            accountKeyIndexes: [1, 2],
                            data: Buffer.from([2, 0, 0, 0, 128, 150, 152, 0, 0, 0, 0, 0]), // Transfer 10 SOL
                        }
                    ],
                    // Mocking VersionedMessage structure minimally
                    header: { numRequiredSignatures: 1, numReadonlySignedAccounts: 0, numReadonlyUnsignedAccounts: 0 },
                    addressTableLookups: []
                }
            },
            meta: {
                err: null,
                fee: 5000,
                loadedAddresses: {
                    writable: [dest],
                    readonly: []
                }
            },
            blockTime: 1234567890
        };

        const result = await parser.parseTransactionResponse(mockTx as VersionedTransactionResponse);

        expect(result).not.toBeNull();
        expect(result.actions).toHaveLength(1);
        const action = result.actions[0];

        expect(action.type).toBe('Transfer');
        expect(action.details.from).toBe(source.toBase58());
        expect(action.details.to).toBe(dest.toBase58()); // This confirms dest was resolved from loadedAddresses
    });
});
