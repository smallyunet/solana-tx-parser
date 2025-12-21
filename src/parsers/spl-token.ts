import { PublicKey } from '@solana/web3.js';
import { Parser, ParserContext, ParsedAction } from '../types';

// Actually package.json didn't list @solana/spl-token. Let's check package.json again. 
// Ah, the user didn't have @solana/spl-token in dependencies, only @solana/web3.js and @coral-xyz/anchor.
// I should probably implement the decoding manually or use layout if I don't want to add a dependency, 
// OR I should add the dependency. The prompt instructions say "You are not allowed to access files not in active workspaces", 
// but I can edit package.json.
// However, typically for a "Parser" library, manual decoding is often preferred or using the layout.
// Let's see if I can use a similar approach to SystemInstruction.
// Wait, @solana/web3.js has some SPL token util? No, that's separate.
// I will implement basic manual decoding for now to avoid extra deps if possible, or better, 
// I will add the dependency because it's much safer.
// BUT, I'll check if I can just assume the prompt allows me to add deps.
// "Code relating to the user's requests should be written in the locations listed above."
// adding dependency requires running a command.
// I'll stick to manual decoding for the most common instructions if it's simple enough, 
// otherwise I really should add the lib.
// Actually, looking at `implementation_plan.md`, I didn't explicitly say I'd add `@solana/spl-token`.
// But it's robust. Let's try to interpret the instruction data manually as it's just a byte parsing.
// 
// SPL Token Layouts:
// Transfer: [3, amount(8)]
// TransferChecked: [12, amount(8), decimals(1)]
// ...
// 
// Let's write the code to parse these manually to keep dependencies low for now 
// (or maybe I should check if I can just `pnpm add` it? The user didn't forbid it).
// Given the user wants a "robust, extensible" library, maybe dependency is better.
// But I'll stick to manual parsing for now as it's often cleaner for a pure decoder than pulling in the whole client lib.

// Re-reading package.json:
// dependencies: { "@coral-xyz/anchor": "^0.32.1", "@solana/web3.js": "^1.98.4", "decimal.js": "^10.6.0" }
//
// I will define the layouts and decode.

export class SplTokenParser implements Parser {
    programId: PublicKey = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
    programId2022: PublicKey = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

    parse(context: ParserContext): ParsedAction | null {
        const { instruction, programId } = context;

        // Check against both Token and Token-2022
        if (!programId.equals(this.programId) && !programId.equals(this.programId2022)) {
            return null;
        }

        const data = instruction.data;
        if (data.length === 0) return null;

        const type = data[0];

        try {
            switch (type) {
                // InitializeAccount: 1
                case 1: {
                    return {
                        protocol: 'SPL Token',
                        type: 'InitializeAccount',
                        summary: 'Initialize Token Actions',
                        details: {
                            account: instruction.keys[0]?.pubkey.toBase58(),
                            mint: instruction.keys[1]?.pubkey.toBase58(),
                            owner: instruction.keys[2]?.pubkey.toBase58()
                        }
                    };
                }
                // Transfer: 3 [u8 instruction, u64 amount]
                case 3: {
                    if (data.length < 9) break;
                    const amount = data.readBigUInt64LE(1);
                    return {
                        protocol: 'SPL Token',
                        type: 'Transfer',
                        summary: `Transfer ${amount.toString()} tokens`,
                        details: {
                            source: instruction.keys[0]?.pubkey.toBase58(),
                            destination: instruction.keys[1]?.pubkey.toBase58(),
                            owner: instruction.keys[2]?.pubkey.toBase58(),
                            amount: amount.toString()
                        }
                    };
                }
                // MintTo: 7 [u8 instruction, u64 amount]
                case 7: {
                    if (data.length < 9) break;
                    const amount = data.readBigUInt64LE(1);
                    return {
                        protocol: 'SPL Token',
                        type: 'MintTo',
                        summary: `Mint ${amount.toString()} tokens`,
                        details: {
                            mint: instruction.keys[0]?.pubkey.toBase58(),
                            destination: instruction.keys[1]?.pubkey.toBase58(),
                            authority: instruction.keys[2]?.pubkey.toBase58(),
                            amount: amount.toString()
                        }
                    };
                }
                // Burn: 8 [u8 instruction, u64 amount]
                case 8: {
                    if (data.length < 9) break;
                    const amount = data.readBigUInt64LE(1);
                    return {
                        protocol: 'SPL Token',
                        type: 'Burn',
                        summary: `Burn ${amount.toString()} tokens`,
                        details: {
                            source: instruction.keys[0]?.pubkey.toBase58(),
                            mint: instruction.keys[1]?.pubkey.toBase58(),
                            authority: instruction.keys[2]?.pubkey.toBase58(),
                            amount: amount.toString()
                        }
                    };
                }
                // TransferChecked: 12 [u8 instruction, u64 amount, u8 decimals]
                case 12: {
                    if (data.length < 10) break;
                    const amount = data.readBigUInt64LE(1);
                    const decimals = data[9];
                    return {
                        protocol: 'SPL Token',
                        type: 'TransferChecked',
                        summary: `Transfer ${Number(amount) / Math.pow(10, decimals)} tokens`,
                        details: {
                            source: instruction.keys[0]?.pubkey.toBase58(),
                            mint: instruction.keys[1]?.pubkey.toBase58(),
                            destination: instruction.keys[2]?.pubkey.toBase58(),
                            owner: instruction.keys[3]?.pubkey.toBase58(),
                            amount: amount.toString(),
                            decimals: decimals
                        }
                    };
                }
                // MintToChecked: 14
                case 14: {
                    if (data.length < 10) break;
                    const amount = data.readBigUInt64LE(1);
                    const decimals = data[9];
                    return {
                        protocol: 'SPL Token',
                        type: 'MintToChecked',
                        summary: `Mint ${Number(amount) / Math.pow(10, decimals)} tokens`,
                        details: {
                            mint: instruction.keys[0]?.pubkey.toBase58(),
                            destination: instruction.keys[1]?.pubkey.toBase58(),
                            authority: instruction.keys[2]?.pubkey.toBase58(),
                            amount: amount.toString(),
                            decimals: decimals
                        }
                    };
                }
                // BurnChecked: 15
                case 15: {
                    if (data.length < 10) break;
                    const amount = data.readBigUInt64LE(1);
                    const decimals = data[9];
                    return {
                        protocol: 'SPL Token',
                        type: 'BurnChecked',
                        summary: `Burn ${Number(amount) / Math.pow(10, decimals)} tokens`,
                        details: {
                            source: instruction.keys[0]?.pubkey.toBase58(),
                            mint: instruction.keys[1]?.pubkey.toBase58(),
                            authority: instruction.keys[2]?.pubkey.toBase58(),
                            amount: amount.toString(),
                            decimals: decimals
                        }
                    };
                }
            }
        } catch (e) {
            console.error("Failed to decode SPL Token instruction", e);
        }

        return {
            protocol: 'SPL Token',
            type: 'Unknown',
            summary: `Unknown SPL Token instruction type ${type}`,
            details: {
                data: data.toString('hex')
            }
        };
    }
}
