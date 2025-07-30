import { execSync } from 'child_process';
import {getResponse} from "./promft.mjs";
import {isUsableRepoName, mkRepo} from "./api.mjs";
import chalk from "chalk";
import fs from "fs";
import path from "path";

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

/** 브랜치 생성 순 반환 **/
export async function getBranchCreationTimes() {
    const dir = ".git/logs/refs/heads";
    const branches = fs.readdirSync(dir);
    const result = [];

    for (const branch of branches) {
        const content = fs.readFileSync(path.join(dir, branch), "utf-8");
        const firstLine = content.split("\n")[0];
        const parts = firstLine.split(" ");

        const fromHash = parts[0];
        const toHash = parts[1];
        const timestamp = parseInt(parts[4], 10);
        const event = firstLine.split('\t')[1];

        result.push({ branch, timestamp, fromHash, toHash, event });
    }

    result.sort((a, b) => a.timestamp - b.timestamp);
    return result;
}

/** 브랜치의 첫 이벤트 **/
function getFirstCommitOfBranch(branch) {

    if (!fs.existsSync(`.git/logs/refs/heads/${branch}`)) return null;
    const firstHistory = execSync(`head -n 1 .git/logs/refs/heads/${branch}`).toString().trim();

    // from to author <email> UNIXtimeStamp timeZone	clone: from https://github.com/teamProject-Y/DiFF.git
    // from to author <email> UNIXtimeStamp timeZone	branch: Created from HEAD
    console.log(firstHistory);
    const info = firstHistory.split('\t')[0].split(' ', 6);
    console.log(info[0]);
    console.log(chalk.bgCyanBright(chalk.black(info[1])));
    console.log(info[2]);
    console.log(info[3]);
    console.log(chalk.bgCyanBright(chalk.black(info[4])));
    console.log(info[5]);

    const commitInfo = firstHistory.split('\t')[1];
    console.log(chalk.bgCyanBright(chalk.black("git event: ", commitInfo)));

    let type;
    if(commitInfo.startsWith('commit' || 'clone:')) {
        type = "default";
    } else {
        type = "branch";
    }

    return { branch, checksum: info[1], UNIXtimeStamp: info[4], type, logInfo: commitInfo };
}

/** 요청 브랜치 마지막 체크섬 **/
export function getLastChecksum(branch) {
    return execSync(`git rev-parse ${branch}`).toString().trim();
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

    console.log(chalk.bgCyanBright(chalk.black("repoName: " + repoName)));
    console.log(chalk.bgCyanBright(chalk.black("usable: " + usable)));

    // git log --reverse --pretty=oneline ${nowBranch} ^${default} | head -n 1
    // head -n 1 .git/logs/refs/heads/yunzivv

    // 첫 커밋 가져오기
    let firstCommit = execSync(`git log --reverse ${branch} --oneline | head -n 1`)
        .toString().trim();

    const checksum = firstCommit.split(' ')[0];
    const commitMessage = firstCommit.split(' ').slice(1).join(' ');
    console.log(chalk.bgCyanBright(chalk.black("first commit: ", firstCommit)));

    // 서버에 리포지토리 DB 데이터 생성 요청
    let mkRepoAndGetId = await mkRepo(memberId, repoName, checksum);
    if(mkRepoAndGetId === null){
        return null;
    }
    console.log(chalk.bgCyanBright(chalk.black("repoID: ", mkRepoAndGetId)));

    // .DiFF 생성



    q.close();
    return checksum;
}

/** .DiFF 디렉토리에서 브랜치 내용 읽기 **/
export async function gg(){

    const isDiFFdirectory = execSync('[ -d .DiFF ] && echo true || echo false').toString().trim();

    if(isDiFFdirectory === 'false') {
        console.log('fatal: not a DiFF repository: .DiFF');
        return null;
    }
    return isDiFFdirectory;
}

/** DiFF 디렉토리 만들기 **/
export async function mkDiFFdirectory(branches){

    if (fs.existsSync(".DiFF")) return null;

    const DiFFdir = execSync("mkdir .DiFF");
    const config = execSync("touch .DiFF/config");
    const meta = execSync("touch .DiFF/meta");
    const branchesDir = execSync("mkdir .DiFF/branches");
    execSync("cd .DiFF/branches");
    for(let branch in branches){

    }

    return null;
}

/** zip 파일 **/
export function mkZip(branch) {
    try {
        const hasTarget = execSync(`[ -d target ] && echo true || echo false`).toString().trim();

        if (hasTarget === "true") {
            execSync(`
                git archive --format=zip --output=withoutTarget.zip ${branch} &&
                rm -rf tempdir && rm -rf difftest.zip &&
                mkdir tempdir &&
                unzip withoutTarget.zip -d tempdir &&
                cp -r target tempdir/ &&
                cd tempdir && zip -r ../difftest.zip . &&
                cd .. &&
                rm withoutTarget.zip &&
                rm -rf tempdir
            `);
        } else {
            execSync(`git archive --format=zip --output=difftest.zip ${branch}`);
        }

        console.log(chalk.bgCyanBright(chalk.black("zip success")));
        execSync(`curl -X POST -F "file=@difftest.zip" http://localhost:8080/upload`);
        execSync(`rm -f difftest.zip`);
        return true;

    } catch (err) {
        console.error("zip error:", err.message);
        return false;
    }
}

/** 첫 체크섬과 마지막 체크섬 사이의 diff **/
export function getDiFF(firstChecksum, lastChecksum) {

    const command = `git diff -W f2b1257e9dfa51eea690b1872b99f8ffc21ba731 ${lastChecksum} | grep -E "^[+-]|^@@"`.trim().replace(/\n/g, ' ');
    return execSync(`sh -c '${command}'`, {
        maxBuffer: 1024 * 1024 * 50 // 50MB 까지 버퍼 허용
    }).toString();

}

/** 로딩 애니메이션 **/
function startAsciiAnimation() {
    const frames = [ `wating`, `...frame2...`, `...frame3...`, `...frame4...` ]; // 위 내용 넣기
    let index = 0;

    console.log("start 압축")
    const interval = setInterval(() => {
        process.stdout.write('\x1Bc');
        console.log(frames[index % frames.length]);
        index++;
    }, 2000);

    return interval;
}

