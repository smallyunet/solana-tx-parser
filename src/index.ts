import { Connection, PublicKey, TransactionResponse, VersionedTransactionResponse, Transaction, VersionedTransaction, Message, VersionedMessage } from '@solana/web3.js';
import { ParserRegistry } from './core/registry';
import { SystemProgramParser } from './parsers/system';
import { SplTokenParser } from './parsers/spl-token';
import { JupiterParser } from './parsers/jupiter';
import { AnchorParser } from './parsers/anchor';
import { RaydiumParser } from './parsers/raydium';
import { OrcaParser } from './parsers/orca';
import { ParsedResult, ParserContext, ParsedAction } from './types';

// Re-export types for consumers
export * from './types';
export { ParserRegistry } from './core/registry';
export { TransactionView } from './ui/TransactionView';
export { ActionCard } from './ui/components/ActionCard';

export class SolanaParser {
    private connection: Connection;
    private registry: ParserRegistry;
    private anchorParser: AnchorParser;

    constructor(connection: Connection) {
        this.connection = connection;
        this.registry = new ParserRegistry();
        this.anchorParser = new AnchorParser();

        // Register default parsers
        this.registry.register(new SystemProgramParser());
        this.registry.register(new SplTokenParser());
        this.registry.register(new JupiterParser());
        this.registry.register(new RaydiumParser());
        this.registry.register(new OrcaParser());
    }

    getRegistry(): ParserRegistry {
        return this.registry;
    }

    async parseTransaction(txId: string): Promise<ParsedResult | null> {
        try {
            const tx = await this.connection.getTransaction(txId, {
                maxSupportedTransactionVersion: 0,
            });

            if (!tx) return null;

            return this.parseTransactionResponse(tx, txId);
        } catch (_e) {
            console.error("Error parsing transaction", _e);
            throw _e;
        }
    }

    async parseTransactionResponse(tx: TransactionResponse | VersionedTransactionResponse, signature: string = ''): Promise<ParsedResult> {
        const message = tx.transaction.message;
        // Unified access to accountKeys
        let accountKeys: PublicKey[];
        const msgAny = message as any;

        if ('staticAccountKeys' in msgAny) {
            accountKeys = msgAny.staticAccountKeys;
            // Append loaded addresses if available (for Versioned Transactions)
            if (tx.meta && tx.meta.loadedAddresses) {
                accountKeys = [
                    ...accountKeys,
                    ...tx.meta.loadedAddresses.writable,
                    ...tx.meta.loadedAddresses.readonly
                ];
            }
        } else {
            accountKeys = msgAny.accountKeys;
        }

        // We pass the meta inner instructions if available
        const innerInstructions = tx.meta?.innerInstructions || undefined;

        const actions = await this.parseMessageInstructions(message, accountKeys, innerInstructions);

        // Calculate fee
        const fee = (tx.meta?.fee || 0) / 1e9;

        return {
            timestamp: tx.blockTime ? tx.blockTime : undefined,
            fee: fee.toFixed(9),
            actions,
            signature,
            success: tx.meta?.err === null
        };
    }

    async simulateAndParse(tx: Transaction | VersionedTransaction): Promise<ParsedResult | null> {
        try {
            const { value: simulated } = await this.connection.simulateTransaction(tx as any); // Type assertion for compatibility

            if (simulated.err) {
                return {
                    fee: "0",
                    actions: [],
                    signature: "SIMULATED_FAILURE",
                    success: false
                };
            }

            // Extract message and keys
            let message: Message | VersionedMessage;
            let accountKeys: PublicKey[];

            if ('version' in tx) {
                message = tx.message;
                accountKeys = message.staticAccountKeys;
            } else {
                message = tx.compileMessage();
                accountKeys = message.accountKeys;
            }

            // Simulation doesn't easily give inner instructions without special RPC config/support.
            // We will parse the top-level instructions.
            const actions = await this.parseMessageInstructions(message, accountKeys, undefined);

            return {
                fee: "0", // Estimated or from simulation if available (unitsConsumed * price)
                actions,
                signature: "SIMULATED",
                success: true
            };

        } catch (_e) {
            console.error("Simulation failed", _e);
            return null;
        }
    }

    private async parseMessageInstructions(
        message: Message | VersionedMessage,
        accountKeys: PublicKey[],
        innerInstructions?: any[]
    ): Promise<ParsedAction[]> {
        const actions: ParsedAction[] = [];
        const msgAny = message as any;
        const instructions = msgAny.compiledInstructions || msgAny.instructions; // Versioned vs Legacy might differ slightly in naming access

        for (const ix of instructions) {
            const programId = accountKeys[ix.programIdIndex];

            const ixAccounts = ix.accountKeyIndexes ?
                ix.accountKeyIndexes.map((idx: number) => accountKeys[idx]) :
                ix.accounts.map((idx: number) => accountKeys[idx]);

            const action = await this.parseInstruction(programId, Buffer.from(ix.data), accountKeys, ixAccounts);
            if (action) actions.push(action);
        }

        // Handle Inner Instructions
        if (innerInstructions) {
            for (const innerBlock of innerInstructions) {
                for (const ix of innerBlock.instructions) {
                    const programId = accountKeys[ix.programIdIndex];
                    const ixAccounts = ix.accounts.map((idx: number) => accountKeys[idx]);

                    const action = await this.parseInstruction(programId, Buffer.from(ix.data), accountKeys, ixAccounts);
                    if (action) actions.push(action);
                }
            }
        }

        return actions;
    }

    /**
     * Helper method to parse a single instruction using registered parsers or fallback to Anchor.
     * @param programId The program ID of the instruction
     * @param data The instruction data buffer
     * @param accountKeys All account keys involved in the transaction
     * @param instructionAccounts The specific accounts used in this instruction
     */
    private async parseInstruction(
        programId: PublicKey,
        data: Buffer,
        accountKeys: PublicKey[],
        instructionAccounts: PublicKey[]
    ): Promise<ParsedAction | null> {
        const parser = this.registry.get(programId);

        const context: ParserContext = {
            tx: {} as any, // Context tx is often not fully used by simple parsers, keeping strict backward compat
            instruction: {
                programId,
                keys: instructionAccounts.map((pubkey: PublicKey) => ({ pubkey, isSigner: false, isWritable: false })),
                data: data,
            },
            accounts: accountKeys,
            programId,
            connection: this.connection
        };

        if (parser) {
            return await parser.parse(context);
        } else {
            // Try Anchor Parser fallback
            const anchorAction = await this.anchorParser.parse(context);
            if (anchorAction) {
                return anchorAction;
            } else {
                return {
                    protocol: 'Unknown',
                    type: 'Unknown',
                    summary: `Instruction for program ${programId.toBase58()}`,
                    details: {
                        data: data.toString('hex')
                    },
                    direction: 'UNKNOWN'
                };
            }
        }
    }
}
