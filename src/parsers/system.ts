import { PublicKey, SystemProgram, SystemInstruction } from '@solana/web3.js';
import { Parser, ParserContext, ParsedAction } from '../types';

export class SystemProgramParser implements Parser {
    programId: PublicKey = SystemProgram.programId;

    parse(context: ParserContext): ParsedAction | null {
        const { instruction } = context;

        try {
            const type = SystemInstruction.decodeInstructionType(instruction);

            if (type === 'Transfer') {
                const decoded = SystemInstruction.decodeTransfer(instruction);
                return {
                    protocol: 'System',
                    type: 'Transfer',
                    summary: `Transferred ${Number(decoded.lamports) / 1e9} SOL`,
                    details: {
                        from: decoded.fromPubkey.toBase58(),
                        to: decoded.toPubkey.toBase58(),
                        amount: decoded.lamports.toString(),
                        decimals: 9
                    },
                    direction: 'UNKNOWN' // Logic to determine direction depends on user wallet, which we might not have yet in this simple context.
                };
            }

            if (type === 'TransferWithSeed') {
                // simplified for now
                return {
                    protocol: 'System',
                    type: 'TransferWithSeed',
                    summary: 'Transfer with Seed',
                    details: {},
                }
            }

            return {
                protocol: 'System',
                type: type || 'Unknown',
                summary: `System Instruction: ${type}`,
                details: {}
            };

        } catch (e) {
            console.error("Failed to decode system instruction", e);
            return null;
        }
    }
}
