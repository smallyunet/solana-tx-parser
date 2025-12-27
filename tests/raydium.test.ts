import { describe, it, expect } from 'vitest';
import { PublicKey, Connection } from '@solana/web3.js';
import { RaydiumParser } from '../src/parsers/raydium';
import { ParserContext } from '../src/types';

describe('RaydiumParser', () => {
    const parser = new RaydiumParser();
    const connection = new Connection('https://api.mainnet-beta.solana.com');

    it('should identify Raydium SwapBaseIn', async () => {
        const data = Buffer.alloc(17);
        data[0] = 9; // SwapBaseIn
        data.writeBigUInt64LE(BigInt(1000000), 1); // amountIn
        data.writeBigUInt64LE(BigInt(500000), 9); // minAmountOut

        const context: ParserContext = {
            tx: {} as any,
            instruction: {
                programId: parser.programId,
                keys: [],
                data: data
            },
            accounts: [],
            programId: parser.programId,
            connection
        };

        const result = await parser.parse(context);
        expect(result).not.toBeNull();
        expect(result?.protocol).toBe('Raydium');
        expect(result?.type).toBe('Swap (BaseIn)');
        expect(result?.summary).toContain('1000000');
        expect(result?.summary).toContain('500000');
    });

    it('should identify Raydium SwapBaseOut', async () => {
        const data = Buffer.alloc(17);
        data[0] = 11; // SwapBaseOut
        data.writeBigUInt64LE(BigInt(2000000), 1); // maxAmountIn
        data.writeBigUInt64LE(BigInt(1000000), 9); // amountOut

        const context: ParserContext = {
            tx: {} as any,
            instruction: {
                programId: parser.programId,
                keys: [],
                data: data
            },
            accounts: [],
            programId: parser.programId,
            connection
        };

        const result = await parser.parse(context);
        expect(result).not.toBeNull();
        expect(result?.protocol).toBe('Raydium');
        expect(result?.type).toBe('Swap (BaseOut)');
        expect(result?.summary).toContain('2000000');
        expect(result?.summary).toContain('1000000');
    });
});
