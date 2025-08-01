import {execSync} from 'child_process';
import { spawn } from 'child_process';
import {getResponse} from "../util/interaction.mjs";
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

/** 요청 브랜치 마지막 체크섬 **/
export async function getLastChecksum(branch) {
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


/** zip 파일 **/
export function doAnalysis(branch) {
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

export function getDiFF(from, to) {

    console.log(chalk.bgCyanBright(chalk.black(from)));
    console.log(chalk.bgCyanBright(chalk.black(to)));

    const wow = '3eed53cf962125bebcabeb00755738a2f3cbb455';

    return new Promise((resolve, reject) => {
        const extensions = ['*.mjs', '*.js', '*.jsx', '*.java', '*.py', '*.jsp'];

        const args = ['diff', '-W', wow, to, '--', ...extensions];
        const child = spawn('git', args, { shell: true });

        let output = '';

        child.stdout.on('data', (data) => {
            output += data.toString();
        });

        child.stderr.on('data', (data) => {
            console.error('stderr:', data.toString());
        });

        child.on('close', (code) => {
            if (code === 0) {
                const filtered = output;

                // 디버깅용
                console.log('+++ raw diff preview:', filtered.slice(0, 100));
                const preview = filtered.length > 100 ? filtered.slice(0, 100) + '...' : filtered;
                console.log('/// diff 미리보기 (앞 100자):');
                console.log(preview);
                console.log('/// diff 미리보기 끝');

                resolve(filtered);
            } else {
                reject(new Error(`git diff exited with code ${code}`));
            }
        });
    });
}