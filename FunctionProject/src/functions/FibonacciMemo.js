const { app } = require('@azure/functions');
const bigInt = require('big-integer');
const { readNth } = require('./Fibonacci');

// Memo global: vive mientras la instancia (proceso del worker de Node.js) siga activa.
// Si la Function App escala a cero o la instancia se recicla, el memo se pierde.
const memo = new Map();
memo.set(0, bigInt.zero);
memo.set(1, bigInt.one);
const instanceStartedAt = new Date().toISOString();

// Enfoque recursivo con memoization.
function fibonacci(n) {
    if (memo.has(n))
        return memo.get(n);
    const value = fibonacci(n - 1).add(fibonacci(n - 2));
    memo.set(n, value);
    return value;
}

app.http('FibonacciMemo', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('JavaScript HTTP trigger function (recursive + memoization) processed a request.');

        const nth = await readNth(request);
        if (isNaN(nth) || nth < 0)
            return { status: 400, body: 'nth must be an integer greater or equal than 0' };

        const memoSizeBefore = memo.size;
        const start = Date.now();
        try {
            const answer = fibonacci(nth).toString();
            return {
                headers: {
                    'x-memo-size-before': String(memoSizeBefore),
                    'x-memo-size-after': String(memo.size),
                    'x-memo-hit': String(memoSizeBefore > nth),
                    'x-elapsed-ms': String(Date.now() - start),
                    'x-instance-started-at': instanceStartedAt
                },
                body: answer
            };
        } catch (e) {
            context.error(`Error computing fibonacci(${nth}): ${e.message}`);
            return {
                status: 500,
                headers: {
                    'x-memo-size-before': String(memoSizeBefore),
                    'x-memo-size-after': String(memo.size),
                    'x-instance-started-at': instanceStartedAt
                },
                body: `Error computing fibonacci(${nth}): ${e.name} - ${e.message}`
            };
        }
    }
});
