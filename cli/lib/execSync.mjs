import { execSync } from 'child_process';
import {getResponse} from "./promft.mjs";
import {isUsableRepoName, mkRepo} from "./api.mjs";
import chalk from "chalk";
import fs from "fs";

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

/** 브랜치 존재 여부 **/
export async function branchExists(branch) {
    const checkBranch =
        execSync(`git show-ref --verify --quiet refs/heads/${branch} && echo "true" || echo "false"`).toString().trim();
    return checkBranch === "true";
}

/** 브랜치 읽기 **/
export async function getLocalBranches() {
    const result = execSync('git branch', { encoding: 'utf-8' });
    const branches = result
        .split('\n')
        .map(b => b.replace('*', '').trim())
        .filter(b => b.length > 0);
    return branches;
}

/** 브랜치의 첫 커밋 매칭 **/
export async function getFirstCommitOfBranch(branch) {

    if (!fs.existsSync(`.git/logs/refs/heads/${branch}`)) return null;
    const firstHistory = execSync(`head -n 1 .git/logs/refs/heads/${branch}`).toString().trim();;

    // from to author <email> UNIXtimeStamp timeZone	clone: from https://github.com/teamProject-Y/DiFF.git
    // from to author <email> UNIXtimeStamp timeZone	branch: Created from HEAD
    console.log(firstHistory);
    const info = firstHistory.split('\t')[0].split(' ', 6);
    console.log(info[0]);
    console.log(chalk.bgCyanBright(info[1]));
    console.log(info[2]);
    console.log(info[3]);
    console.log(info[4]);
    console.log(info[5]);

    const commitInfo = firstHistory.split('\t')[1];
    console.log(commitInfo);

    let type;
    if(commitInfo.startsWith('commit (initial):' || 'clone:')) { // commit ? commit (initial): ?
        type = "default";
    } else {
        type = "branch";
    }

    return { branch, checksum: info[1], type, logInfo: commitInfo };
}

/** .DiFF 디렉토리 만들기 **/
export async function DiFFinit(memberId, branch) {

    const q = await getResponse();
    console.log(' Your repository isn\'t connected.');

    // repository 이름 입력, 중복 확인
    let repoName = await q.ask(' Please enter your new DiFF repository name: ');
    let usable = await isUsableRepoName(memberId, repoName);
    while(!usable){
        repoName = await q.ask(' This repository name is already in use. Try a different one: ');
        usable = await isUsableRepoName(memberId, repoName);
    }

    console.log(chalk.bgYellow("repoName: " + repoName));
    console.log(chalk.bgYellow("usable: " + usable));

    // git log --reverse --pretty=oneline ${nowBranch} ^${default} | head -n 1
    // head -n 1 .git/logs/refs/heads/yunzivv

    // 첫 커밋 가져오기
    let firstCommit = execSync(`git log --reverse ${branch} --oneline | head -n 1`)
        .toString().trim();

    const checksum = firstCommit.split(' ')[0];
    const commitMessage = firstCommit.split(' ').slice(1).join(' ');
    console.log(chalk.bgYellow("first commit: ", firstCommit));

    // 서버에 리포지토리 DB 데이터 생성 요청
    let mkRepoAndGetId = await mkRepo(memberId, repoName, checksum);
    if(mkRepoAndGetId === null){
        return null;
    }
    console.log(chalk.bgYellow("repoID: ", mkRepoAndGetId))

    // .DiFF 생성



    q.close();
    return checksum;
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
        const target = execSync(`[ -d target ] && echo true || echo false`);
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
        console.log("zip su");

        execSync(`curl -X POST -F "file=@difftest.zip" http://localhost:8080/upload`);
        return true;

    } catch (err) {
        console.error("zip error:", err.message);
        return false;
    }
}

export function getLastChecksum(branch) {
    return execSync(`git rev-parse ${branch}`).toString().trim();
}

export function getDiFF(firstChecksum, lastChecksum) {
    const command = `git diff -W ${firstChecksum} ${lastChecksum} | grep -E "^[+-]|^@@"`.trim().replace(/\n/g, ' ');
    return execSync(`sh -c '${command}'`).toString();

}


function startAsciiAnimation() {
    const frames = [ `wating`, `...frame2...`, `...frame3...`, `...frame4...` ]; // 위 내용 넣기
    let index = 0;

    console.log("start 압축")
    const interval = setInterval(() => {
        process.stdout.write('\x1Bc'); // clear terminal
        console.log(frames[index % frames.length]);
        index++;
    }, 2000);

    return interval; // 나중에 clearInterval() 호출할 수 있도록
}

