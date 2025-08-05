// lib/input.mjs
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';

/** 사용자 입력 상호작용 **/
export async function getResponse() {

    const rl = readline.createInterface({ input, output });

    return {
        ask: async (message) => {
            return await rl.question(message);
        },
        close: () => rl.close(),
    };
}
