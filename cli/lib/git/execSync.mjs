import {execSync} from 'child_process';
import { spawn } from 'child_process';
import chalk from "chalk";

import {getResponse} from "../util/interaction.mjs";
import {isUsableRepoName, mkRepo} from "../api/api.mjs";
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

/** 애니메이션과 병렬 실행 가능한 doAnalysis **/
export async function doAnalysis(branch) {
    try {
        const hasTarget = await new Promise((resolve) => {
            const p = spawn('[ -d target ] && echo true || echo false', { shell: true });
            let out = '';
            p.stdout.on('data', d => out += d.toString());
            p.on('close', () => resolve(out.trim() === 'true'));
        });

        if (hasTarget) {
            await sh(`git archive --format=zip --output=withoutTarget.zip ${branch}`);
            await sh(`rm -rf tempdir difftest.zip`);
            await sh(`mkdir tempdir`);
            await sh(`unzip withoutTarget.zip -d tempdir`);
            await sh(`cp -r target tempdir/`);
            await sh(`cd tempdir && zip -r ../difftest.zip .`);
            await sh(`rm withoutTarget.zip && rm -rf tempdir`);
        } else {
            await sh(`git archive --format=zip --output=difftest.zip ${branch}`);
        }

        // console.log(chalk.bgCyanBright(chalk.black("zip success")));
        // await sh(`curl -X POST -F "file=@difftest.zip" http://localhost:8080/upload`);
        await sh(`curl -s -X POST -F "file=@difftest.zip" http://localhost:8080/upload`);
        await sh(`rm -f difftest.zip`);

        return true;
    } catch (err) {
        console.error("zip error:", err.message);
        return false;
    }
}

// 비동기로 cmd
export async function sh(cmd, passthrough = false) {
    return new Promise((resolve, reject) => {
        const p = spawn(cmd, {
            stdio: passthrough ? 'inherit' : 'pipe',
            shell: true,
        });

        let out = '';
        let err = '';

        if (!passthrough) {
            p.stdout.on('data', d => out += d.toString());
            p.stderr.on('data', d => err += d.toString());
        }

        p.on('close', code => {
            if (code === 0) resolve(out.trim());
            else reject(new Error(`command failed: ${cmd}\n${err}`));
        });
    });
}

export function getDiFF(from, to) {

    console.log(chalk.bgCyanBright(chalk.black(from)));
    console.log(chalk.bgCyanBright(chalk.black(to)));

    // test용
    // const wow = '0ca64e180ab30fc853c887de27e72ef2595d7546';

    return new Promise((resolve, reject) => {
        const extensions = ['*.mjs', '*.jsx', '*.java', '*.ts', '*.tsx', '*.jsp', // '*.js',
            '*.py', '*.c', '*.cs', '*.cpp', '*.php', '*.go', '*.rs', '*.rb', '*.kt', '*.swift'];

        const args = ['diff', '-W', from, to, '--', ...extensions];
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
                console.log(chalk.bgCyanBright(chalk.black('+++ raw diff preview:', filtered.slice(0, 100))));
                const preview = filtered.length > 100 ? filtered.slice(0, 100) + '...' : filtered;
                console.log(chalk.bgCyanBright(chalk.black('/// diff 미리보기 (앞 100자):')));
                console.log(preview);
                console.log(chalk.bgCyanBright(chalk.black('/// diff 미리보기 끝')));

                resolve(filtered);
            } else {
                reject(new Error(`git diff exited with code ${code}`));
            }
        });
    });
}