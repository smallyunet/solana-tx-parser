import { ParsedResult } from '../../../src/types';

export const MOCK_DATA: Record<string, ParsedResult> = {
    '5UfDuX7WXY18keiz9mZ6zKkY8JyNuLDFz2UMGqE8CRN57pRBbME6VxWJbHqftiXxhozVhzR3vo4qJpUktqt5sMEj': {
        timestamp: 1735261200,
        fee: '0.000005000',
        signature: '5UfDuX7WXY18keiz9mZ6zKkY8JyNuLDFz2UMGqE8CRN57pRBbME6VxWJbHqftiXxhozVhzR3vo4qJpUktqt5sMEj',
        success: true,
        actions: [
            {
                protocol: 'System Program',
                type: 'Transfer',
                summary: 'Transfer 0.1 SOL',
                details: {
                    from: '7root6TshN9R5wBvG9Rz88y2K6F89rDpj6z3hG9Rz88y',
                    to: '9vQ1Sbh6fGh2L6sDpj6z3hG9Rz88y2K6F89rDpj6z3h',
                    amount: '0.1'
                },
                direction: 'OUT'
            }
        ]
    },
    '4vD3pSETPxuoMXrYhY3naJgfpEqyfqvv7xSfPvnTUXFp4y9FZv4v6vEpQPvHUfXmNLfVsVZHkZGkJWmz1xnfkPxL': {
        timestamp: 1735261300,
        fee: '0.000010000',
        signature: '4vD3pSETPxuoMXrYhY3naJgfpEqyfqvv7xSfPvnTUXFp4y9FZv4v6vEpQPvHUfXmNLfVsVZHkZGkJWmz1xnfkPxL',
        success: true,
        actions: [
            {
                protocol: 'SPL Token',
                type: 'Transfer',
                summary: 'Transfer 50.00 USDC',
                details: {
                    from: '7root6TshN9R5wBvG9Rz88y2K6F89rDpj6z3hG9Rz88y',
                    to: '9vQ1Sbh6fGh2L6sDpj6z3hG9Rz88y2K6F89rDpj6z3h',
                    amount: '50.00',
                    token: 'USDC'
                },
                direction: 'OUT'
            }
        ]
    },
    '3gyPgPLkRT98vMZRd3RhBrK6z7HeHrXhBfJeyxZQNGHrBJJquJkW8mvFrABhJu4RP5aJ9zgg4F6DmWxWwjf2pump': {
        timestamp: 1735261400,
        fee: '0.000015000',
        signature: '3gyPgPLkRT98vMZRd3RhBrK6z7HeHrXhBfJeyxZQNGHrBJJquJkW8mvFrABhJu4RP5aJ9zgg4F6DmWxWwjf2pump',
        success: true,
        actions: [
            {
                protocol: 'Jupiter',
                type: 'Swap',
                summary: 'Swap 1.5 SOL for 250.00 USDC',
                details: {
                    fromToken: 'SOL',
                    toToken: 'USDC',
                    fromAmount: '1.5',
                    toAmount: '250.00'
                },
                direction: 'IN'
            },
            {
                protocol: 'System Program',
                type: 'Transfer',
                summary: 'Transfer 1.5 SOL',
                details: {
                    from: '7root6TshN9R5wBvG9Rz88y2K6F89rDpj6z3hG9Rz88y',
                    to: 'Jupiter Aggregator v6',
                    amount: '1.5'
                },
                direction: 'OUT'
            },
            {
                protocol: 'SPL Token',
                type: 'Transfer',
                summary: 'Transfer 250.00 USDC',
                details: {
                    from: 'Jupiter Aggregator v6',
                    to: '7root6TshN9R5wBvG9Rz88y2K6F89rDpj6z3hG9Rz88y',
                    amount: '250.00'
                },
                direction: 'IN'
            }
        ]
    }
};
