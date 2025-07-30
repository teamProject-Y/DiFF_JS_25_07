import {execSync} from 'child_process';
import {getResponse} from "../util/promft.mjs";
import {isUsableRepoName, mkRepo} from "../api/api.mjs";
import chalk from "chalk";
import {mkDiFFdirectory} from "../DiFF/init.mjs";

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
    return result
        .split('\n')
        .map(b => b.replace('*', '').trim())
        .filter(b => b.length > 0);
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
    console.log(chalk.bgCyanBright(chalk.black("first commit: ", firstCommit)));

    // 서버에 리포지토리 DB 데이터 생성 요청
    let mkRepoAndGetId = await mkRepo(memberId, repoName, checksum);
    if(mkRepoAndGetId === null){
        return null;
    }
    console.log(chalk.bgCyanBright(chalk.black("repoID: ", mkRepoAndGetId)));

    // .DiFF 생성
    await mkDiFFdirectory(mkRepoAndGetId);


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

// export async function mkDiFFdirectory(branches, repositoryId){
//
//     if (fs.existsSync(".DiFF")) return null;
//
//     const DiFFdir = execSync("mkdir .DiFF");
//     const config = execSync("touch .DiFF/config");
//     const meta = execSync("touch .DiFF/meta");
//     const branchesDir = execSync("mkdir .DiFF/branches");
//     execSync("cd .DiFF/branches");
//     for(let branch in branches){
//
//     }
//
//     return null;
// }

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

    const command = `git diff -W dcbdf96aee585f7f624c2003eeeb14b7c035d877 ${lastChecksum} | grep -E "^[+-]|^@@"`.trim().replace(/\n/g, ' ');
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

