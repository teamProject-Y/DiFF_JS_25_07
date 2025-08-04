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
// utils.mjs
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const FRAMES = [
    `
      ___                       ___           ___     
     /\\  \\          ___        /\\  \\         /\\  \\    
    /::\\  \\        /\\  \\      /::\\  \\       /::\\  \\   
   /:/\\:\\  \\       \\:\\  \\    /:/\\:\\  \\     /:/\\:\\  \\  
  /:/  \\:\\__\\      /::\\__\\  /::\\~\\:\\  \\   /::\\~\\:\\  \\ 
 /:/__/ \\:|__|  __/:/\\/__/ /:/\\:\\ \\:\\__\\ /:/\\:\\ \\:\\__\\
 \\:\\  \\ /:/  / /\\/:/  /    \\/__\\:\\ \\/__/ \\/__\\:\\ \\/__/
  \\:\\  /:/  /  \\::/__/          \\:\\__\\        \\:\\__\\  
   \\:\\/:/  /    \\:\\__\\           \\/__/         \\/__/  
    \\::/__/      \\/__/                                
     ~~                                               
`,
    `
                                ___           ___     
     _____                     /\\__\\         /\\__\\    
    /::\\  \\       ___         /:/ _/_       /:/ _/_   
   /:/\\:\\  \\     /\\__\\       /:/ /\\__\\     /:/ /\\__\\  
  /:/  \\:\\__\\   /:/__/      /:/ /:/  /    /:/ /:/  /  
 /:/__/ \\:|__| /::\\  \\     /:/_/:/  /    /:/_/:/  /   
 \\:\\  \\ /:/  / \\/\\:\\  \\__  \\:\\/:/  /     \\:\\/:/  /    
  \\:\\  /:/  /   ~~\\:\\/\\__\\  \\::/__/       \\::/__/     
   \\:\\/:/  /       \\::/  /   \\:\\  \\        \\:\\  \\     
    \\::/  /        /:/  /     \\:\\__\\        \\:\\__\\    
     \\/__/         \\/__/       \\/__/         \\/__/    
`,
    `
     _____                      ___         ___   
    /  /::\\       ___          /  /\\       /  /\\  
   /  /:/\\:\\     /  /\\        /  /:/_     /  /:/_ 
  /  /:/  \\:\\   /  /:/       /  /:/ /\\   /  /:/ /\\
 /__/:/ \\__\\:| /__/::\\      /  /:/ /:/  /  /:/ /:/
 \\  \\:\\ /  /:/ \\__\\/\\:\\__  /__/:/ /:/  /__/:/ /:/ 
  \\  \\:\\  /:/     \\  \\:\\/\\ \\  \\:\\/:/   \\  \\:\\/:/  
   \\  \\:\\/:/       \\__\\::/  \\  \\::/     \\  \\::/   
    \\  \\::/        /__/:/    \\  \\:\\      \\  \\:\\   
     \\__\\/         \\__\\/      \\  \\:\\      \\  \\:\\  
                               \\__\\/       \\__\\/  
`,
    `
      ___                                              
     /  /\\           ___         ___           ___     
    /  /::\\         /__/\\       /  /\\         /  /\\    
   /  /:/\\:\\        \\__\\:\\     /  /::\\       /  /::\\   
  /  /:/  \\:\\       /  /::\\   /  /:/\\:\\     /  /:/\\:\\  
 /__/:/ \\__\\:|   __/  /:/\\/  /  /::\\ \\:\\   /  /::\\ \\:\\ 
 \\  \\:\\ /  /:/  /__/\\/:/~~  /__/:/\\:\\ \\:\\ /__/:/\\:\\ \\:\\
  \\  \\:\\  /:/   \\  \\::/     \\__\\/  \\:\\_\\/ \\__\\/  \\:\\_\\/
   \\  \\:\\/:/     \\  \\:\\          \\  \\:\\        \\  \\:\\  
    \\__\\::/       \\__\\/           \\__\\/         \\__\\/  
        ~~                                             
`
];

// export async function runAnimation(isRunningRef) {
//     const frames = [];
//     const lineCount = 11;
//     let t = 0;
//
//     for (let i = 0; i < lineCount; i++) {
//         console.log('');
//     }
//
//     while (isRunningRef.value) {
//         // 커서를 위로 이동해서 11줄 덮어쓰기
//         process.stdout.write(`\x1B[${lineCount}A`);
//
//         for (let i = 0; i < lineCount; i++) {
//             const frame = frames[(t + i) % frames.length];
//             process.stdout.write(`줄 ${i + 1}: ${frame}\n`);
//         }
//
//         t++;
//         await sleep(200); // 빠르게 움직이게 하려면 100~200ms
//     }
//
//     process.stdout.write(`\x1B[${lineCount}A`);
//     for (let i = 0; i < lineCount; i++) {
//         process.stdout.write(`줄 ${i + 1}: 완료!\n`);
//     }
// }

export async function runAnimation(isRunningRef) {
    let t = 0;
    const lineCount = 13;

    process.stdout.write('\n'.repeat(13));

    while (isRunningRef.value) {
        process.stdout.write(`\x1B[${lineCount}A`); // 커서 위로

        const lines = FRAMES[t % FRAMES.length].split('\n');

        for (let i = 0; i < lineCount; i++) {
            process.stdout.write('\x1B[2K');               // 현재 줄 전체 지움
            process.stdout.write((lines[i] || '') + '\n'); // 줄이 없으면 빈 줄
        }

        t++;
        await sleep(300);
    }

    process.stdout.write(`\x1B[${lineCount}A`);
    for (let i = 0; i < lineCount; i++) {
        process.stdout.write('\x1B[2K\n');
    }

    process.stdout.write('\x1B[14A');
    process.stdout.write('생성 완료\n');
}
