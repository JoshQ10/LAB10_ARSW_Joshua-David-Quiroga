const { app } = require('@azure/functions');
const bigInt = require('big-integer');

// Fibonacci iterativo (version original del laboratorio migrada al modelo de programacion v4 de Node.js).
async function readNth(request) {
    let nth = request.query.get('nth');
    if (request.method === 'POST') {
        try {
            const body = await request.json();
            if (body && body.nth !== undefined) nth = body.nth;
        } catch (e) { /* body vacio o invalido: se usa el query param */ }
    }
    return parseInt(nth);
}

app.http('Fibonacci', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log('JavaScript HTTP trigger function processed a request.');

        const nth = await readNth(request);
        let nth_1 = bigInt.one;
        let nth_2 = bigInt.zero;
        let answer = bigInt.zero;

        if (isNaN(nth) || nth < 0)
            return { status: 400, body: 'nth must be an integer greater or equal than 0' };
        else if (nth === 0)
            answer = nth_2;
        else if (nth === 1)
            answer = nth_1;
        else {
            for (let i = 0; i < nth - 1; i++) {
                answer = nth_2.add(nth_1);
                nth_2 = nth_1;
                nth_1 = answer;
            }
        }

        return { body: answer.toString() };
    }
});

module.exports = { readNth };
