import { PublicKey } from '@solana/web3.js';
import { Parser } from '../types';

export class ParserRegistry {
    private parsers: Map<string, Parser> = new Map();

    constructor() { }

    register(parser: Parser) {
        this.parsers.set(parser.programId.toBase58(), parser);
    }

    get(programId: string | PublicKey): Parser | undefined {
        const key = typeof programId === 'string' ? programId : programId.toBase58();
        return this.parsers.get(key);
    }

    getAll(): Parser[] {
        return Array.from(this.parsers.values());
    }
}
