import { PublicKey } from '@solana/web3.js';
import { Parser, ParserContext, ParsedAction } from '../types';
import { AnchorParser } from './anchor';

export class OrcaParser implements Parser {
    programId = new PublicKey("whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc");

    async parse(context: ParserContext): Promise<ParsedAction | null> {
        const anchorParser = new AnchorParser();
        const action = await anchorParser.parse(context);

        if (action && action.type === 'swap') {
            const data = action.details.data as any;
            if (data) {
                const amount = data.amount || '0';
                const otherAmountThreshold = data.otherAmountThreshold || '0';
                const sqrtPriceLimit = data.sqrtPriceLimit || '0';
                const amountSpecifiedIsInput = data.amountSpecifiedIsInput;

                if (amountSpecifiedIsInput) {
                    action.summary = `Orca Swap: ${amount} (Input) -> min ${otherAmountThreshold}`;
                } else {
                    action.summary = `Orca Swap: max ${otherAmountThreshold} -> ${amount} (Output)`;
                }

                action.details.extractedAmounts = {
                    amount,
                    otherAmountThreshold,
                    sqrtPriceLimit,
                    amountSpecifiedIsInput
                };
            }
        }

        return action;
    }
}
