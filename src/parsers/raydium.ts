import { PublicKey } from '@solana/web3.js';
import { Parser, ParserContext, ParsedAction } from '../types';

export class RaydiumParser implements Parser {
    programId = new PublicKey("675k1q2yz7z9L1pXWCPH1UJVP2oJ6GZDL7wiP1W69f5C");

    async parse(context: ParserContext): Promise<ParsedAction | null> {
        const { instruction } = context;
        const data = instruction.data;

        if (data.length < 1) return null;

        const discriminator = data[0];

        // Raydium Liquidity Pool V4 SwapBaseIn is discriminator 9
        if (discriminator === 9) {
            if (data.length < 17) return null;

            const amountIn = data.readBigUInt64LE(1);
            const minAmountOut = data.readBigUInt64LE(9);

            return {
                protocol: 'Raydium',
                type: 'Swap (BaseIn)',
                summary: `Raydium Swap: ${amountIn.toString()} -> min ${minAmountOut.toString()}`,
                details: {
                    amountIn: amountIn.toString(),
                    minAmountOut: minAmountOut.toString(),
                },
                direction: 'UNKNOWN'
            };
        }

        // SwapBaseOut is 11
        if (discriminator === 11) {
            if (data.length < 17) return null;

            const maxAmountIn = data.readBigUInt64LE(1);
            const amountOut = data.readBigUInt64LE(9);

            return {
                protocol: 'Raydium',
                type: 'Swap (BaseOut)',
                summary: `Raydium Swap: max ${maxAmountIn.toString()} -> ${amountOut.toString()}`,
                details: {
                    maxAmountIn: maxAmountIn.toString(),
                    amountOut: amountOut.toString(),
                },
                direction: 'UNKNOWN'
            };
        }

        return {
            protocol: 'Raydium',
            type: 'Unknown',
            summary: `Raydium Instruction (ID: ${discriminator})`,
            details: {
                discriminator
            },
            direction: 'UNKNOWN'
        };
    }
}
