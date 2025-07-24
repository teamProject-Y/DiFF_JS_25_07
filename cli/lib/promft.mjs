// lib/input.mjs
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';

/** 생성된 rl을 통해 ask, close 메서드를 제공 **/
export async function getResponse() {

    const rl = readline.createInterface({ input, output });

    return {
        ask: async (message) => {
            return await rl.question(message);
        },
        close: () => rl.close(),
    };
}
