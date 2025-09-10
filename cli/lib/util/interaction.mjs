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

export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const FRAMES = [
    `      ___                       ___           ___     
     /\\  \\          ___        /\\  \\         /\\  \\    
    /::\\  \\        /\\  \\      /::\\  \\       /::\\  \\   
   /:/\\:\\  \\       \\:\\  \\    /:/\\:\\  \\     /:/\\:\\  \\  
  /:/  \\:\\__\\      /::\\__\\  /::\\~\\:\\  \\   /::\\~\\:\\  \\ 
 /:/__/ \\:|__|  __/:/\\/__/ /:/\\:\\ \\:\\__\\ /:/\\:\\ \\:\\__\\
 \\:\\  \\ /:/  / /\\/:/  /    \\/__\\:\\ \\/__/ \\/__\\:\\ \\/__/
  \\:\\  /:/  /  \\::/__/          \\:\\__\\        \\:\\__\\  
   \\:\\/:/  /    \\:\\__\\           \\/__/         \\/__/  
    \\::/__/      \\/__/                                
     ~~`,
    `                                ___           ___     
     _____                     /\\__\\         /\\__\\    
    /::\\  \\       ___         /:/ _/_       /:/ _/_   
   /:/\\:\\  \\     /\\__\\       /:/ /\\__\\     /:/ /\\__\\  
  /:/  \\:\\__\\   /:/__/      /:/ /:/  /    /:/ /:/  /  
 /:/__/ \\:|__| /::\\  \\     /:/_/:/  /    /:/_/:/  /   
 \\:\\  \\ /:/  / \\/\\:\\  \\__  \\:\\/:/  /     \\:\\/:/  /    
  \\:\\  /:/  /   ~~\\:\\/\\__\\  \\::/__/       \\::/__/     
   \\:\\/:/  /       \\::/  /   \\:\\  \\        \\:\\  \\     
    \\::/  /        /:/  /     \\:\\__\\        \\:\\__\\    
     \\/__/         \\/__/       \\/__/         \\/__/`,
    `     _____                      ___         ___   
    /  /::\\       ___          /  /\\       /  /\\  
   /  /:/\\:\\     /  /\\        /  /:/_     /  /:/_ 
  /  /:/  \\:\\   /  /:/       /  /:/ /\\   /  /:/ /\\
 /__/:/ \\__\\:| /__/::\\      /  /:/ /:/  /  /:/ /:/
 \\  \\:\\ /  /:/ \\__\\/\\:\\__  /__/:/ /:/  /__/:/ /:/ 
  \\  \\:\\  /:/     \\  \\:\\/\\ \\  \\:\\/:/   \\  \\:\\/:/  
   \\  \\:\\/:/       \\__\\::/  \\  \\::/     \\  \\::/   
    \\  \\::/        /__/:/    \\  \\:\\      \\  \\:\\   
     \\__\\/         \\__\\/      \\  \\:\\      \\  \\:\\  
                               \\__\\/       \\__\\/`,
    `      ___                                              
     /  /\\           ___         ___           ___     
    /  /::\\         /__/\\       /  /\\         /  /\\    
   /  /:/\\:\\        \\__\\:\\     /  /::\\       /  /::\\   
  /  /:/  \\:\\       /  /::\\   /  /:/\\:\\     /  /:/\\:\\  
 /__/:/ \\__\\:|   __/  /:/\\/  /  /::\\ \\:\\   /  /::\\ \\:\\ 
 \\  \\:\\ /  /:/  /__/\\/:/~~  /__/:/\\:\\ \\:\\ /__/:/\\:\\ \\:\\
  \\  \\:\\  /:/   \\  \\::/     \\__\\/  \\:\\_\\/ \\__\\/  \\:\\_\\/
   \\  \\:\\/:/     \\  \\:\\          \\  \\:\\        \\  \\:\\  
    \\__\\::/       \\__\\/           \\__\\/         \\__\\/  
        ~~`
];

export async function runAnimation(isRunningRef) {
    let t = 0;
    const maxLines = Math.max(...FRAMES.map(f => f.split('\n').length));

    // 커서 숨기기
    process.stdout.write('\x1B[?25l');

    // 빈 줄로 자리 만들기
    process.stdout.write('\n'.repeat(maxLines));

    while (isRunningRef.value) {
        process.stdout.write(`\x1B[${maxLines}A`); // 맨 위로

        const frameLines = FRAMES[t % FRAMES.length].split('\n');
        for (let i = 0; i < maxLines; i++) {
            process.stdout.write('\x1B[2K'); // 한 줄 클리어
            process.stdout.write((frameLines[i] || '') + '\n');
        }

        t++;
        await sleep(300);
    }

    // 애니메이션 클리어
    process.stdout.write(`\x1B[${maxLines}A`);
    for (let i = 0; i < maxLines; i++) {
        process.stdout.write('\x1B[2K\n');
    }

    process.stdout.write(`\x1B[${maxLines}A`);
    process.stdout.write('\x1B[2K');
    // process.stdout.write('analysis success.\n');

    process.stdout.write('\x1B[?25h');
}