// ErgoJS
// written by ccjt

class ErgoJSCore {
    async tryAwait(input, thisArg, ...args) {
        // note: non-promise values resolve immediately!

        try {
            return {
                result: await (typeof input === 'function' ? input.apply(thisArg, args) : input), 
                error: null
            }
        } catch (error) {
            return {
                result: null,
                error
            }
        }
    }

    async retryAwait(fn, { attempts = 1, delay = 500 }, thisArg, ...args) {
        // attempt safeguarding
        if (typeof attempts !== "number")
            throw new TypeError(`Parameter "attempts" must be an integer, not "${typeof attempts}".`);

        if (!isFinite(attempts))
            throw new RangeError('Parameter "attempts" must be a finite integer.');

        if (isNaN(attempts))
            throw new RangeError('Parameter "attempts" must be an integer, not NaN.');

        if (attempts < 1)
            throw new RangeError('Parameter "attempts" must be a positive integer or zero.');

        if (attempts === 0)
            return undefined;

        if (attempts > 100)
            throw new RangeError('Parameter "attempts" must be less than 100.');

        if (attempts % 1 > 0) {
            console.warn(`[ErgoJS] ${attempts} attempts truncated to ${Math.trunc(attempts)} in retryAwait`)
            attempts = Math.trunc(attempts);
        }


        const errors = [];

        for (let attempt = 1; attempt <= attempts; attempt++) {
            try {
                return await fn.apply(thisArg, args);
            } catch (error) {
                errors.push(error);

                if (attempt < attempts) {
                    await new Promise(r => setTimeout(r, delay));
                }
            }
        }

        throw new AggregateError(errors, 'Retry failed');
    }
}

const ErgoJS = new ErgoJSCore()
export default ErgoJS
export { ErgoJSCore }