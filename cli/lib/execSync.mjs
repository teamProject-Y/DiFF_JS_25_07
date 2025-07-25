import { execSync } from 'child_process';
import {getResponse} from "./promft.mjs";
import {isUsableRepoName, mkRepo} from "./api.mjs";
import chalk from "chalk";
import fs from "fs";

const q = await getResponse();

/** git repository 여부 **/
export async function existsGitDirectory(){

    const isGitDirectory = execSync('[ -d .git ] && echo true || echo false').toString().trim();

    if(isGitDirectory === 'false') {
        console.log('fatal: not a git repository (or any of the parent directories): .git');
    }
    return isGitDirectory;
}

/** .DiFF 디렉토리 존재 여부 **/
export async function existsDiFF() {
    return execSync('[ -d .DiFF ] && echo true || echo false').toString().trim();
}

/** .DiFF 디렉토리 만들기 **/
export async function DiFFinit(memberId, branch) {

    console.log(' Your repository isn\'t connected.');

    // repository 이름 중복 확인
    let repoName = await q.ask(' Please enter your new DiFF repository name: ');
    let usable = await isUsableRepoName(memberId, repoName);
        // console.log('usable =', usable, typeof usable);
    while(!usable){
        repoName = await q.ask(' This repository name is already in use. Try a different one: ');
        usable = await isUsableRepoName(memberId, repoName);
    }

    console.log("repoName: " + repoName);
    console.log("usable: " + usable);

    // 첫 커밋 가져오기
    let firstCommit = execSync(`git log --reverse ${branch} --oneline | head -n 1`)
        .toString().trim();

    const commitHash = firstCommit.split(' ')[0];
    const commitMessage = firstCommit.split(' ').slice(1).join(' ');
    console.log(chalk.bgYellow("first commit: ", firstCommit));

    // 서버에 리포지토리 DB 데이터 생성 요청
    let mkRepoAndGetId = await mkRepo(memberId, repoName, commitHash);
    if(mkRepoAndGetId === null){
        return null;
    }
    console.log(chalk.bgYellow("repoID: ", mkRepoAndGetId))

    // .DiFF 생성



    q.close();
    return commitMessage;
}


/** .DiFF 디렉토리에서 브랜치 내용 읽기 **/
export async function gg(){

    const isGitDirectory = execSync('[ -d .git ] && echo true || echo false').toString().trim();

    if(isGitDirectory === 'false') {
        console.log('fatal: not a git repository (or any of the parent directories): .git');
        return null;
    }
    return isGitDirectory;
}

/** DiFF 디렉토리 만들기 **/
export async function mkDiFFdirectory(){

    if (fs.existsSync(".DiFF")) return null;

    const DiFFdir = execSync("mkdir .DiFF");
    const config = execSync("touch .DiFF/config");
    const meta = execSync("touch .DiFF/meta");
    const branchesDir = execSync("mkdir .DiFF/branches");

    return null;
}

/** zip 파일 **/
export function mkZip(branch) {

    try {
        execSync(`
      git archive --format=zip --output=withoutTarget.zip ${branch} &&
      rm -rf tempdir &&
      mkdir tempdir &&
      unzip withoutTarget.zip -d tempdir &&
      cp -r target tempdir/ &&
      cd tempdir && zip -r ../difftest.zip . &&
      cd .. &&
      rm withoutTarget.zip &&
      rm -rf tempdir
    `);

        execSync(`curl -X POST -F "file=@difftest.zip" http://localhost:8080/upload`);

        return true;

    } catch (err) {
        console.error("zip error:", err.message);
        return false;
    }
}

function startAsciiAnimation() {
    const frames = [ `...frame1...`, `...frame2...`, `...frame3...`, `...frame4...` ]; // 위 내용 넣기
    let index = 0;

    const interval = setInterval(() => {
        process.stdout.write('\x1Bc'); // clear terminal
        console.log(frames[index % frames.length]);
        index++;
    }, 4000);

    return interval; // 나중에 clearInterval() 호출할 수 있도록
}

