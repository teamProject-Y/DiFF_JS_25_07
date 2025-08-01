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

/** 로딩 애니메이션 **/
function startAsciiAnimation() {
    const frames = [ `wating`, `...frame2...`, `...frame3...`, `...frame4...` ];
    let index = 0;

    console.log("start 압축")
    const interval = setInterval(() => {
        process.stdout.write('\x1Bc');
        console.log(frames[index % frames.length]);
        index++;
    }, 2000);

    return interval;
}
