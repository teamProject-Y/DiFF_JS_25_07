import { execSync } from 'child_process';
import {getResponse} from "./promft.mjs";
import {isUsableRepoName, mkRepo} from "./api.mjs";

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
export async function mkDiFF(memberId, branch) {

    console.log(' Your repository isn\'t connected.');

    // repository 이름 중복 확인
    let repoName = await q.ask(' Please enter your new DiFF repository name: ');
    let usable = await isUsableRepoName(memberId, repoName);
    // console.log('usable =', usable, typeof usable);
    while(!usable){
        repoName = await q.ask(' This repository name is already in use. Try a different one: ');
        usable = await isUsableRepoName(memberId, repoName);
    }

    // 첫 커밋 가져오기
    let firstCommit = execSync(`git log --reverse ${branch} --oneline | head -n 1`)
        .toString().trim();

    const commitHash = firstCommit.split(' ')[0];
    const commitMessage = firstCommit.split(' ').slice(1).join(' ');

    // 서버에 리포지토리 DB 데이터 생성 요청
    // let mkRepoRQ = await mkRepo(memberId, repoName, commitHash);
    // console.log("repoID: ", mkrepoRq.data)

    // .DiFF 생성


    q.close();
    return commitMessage;
}


/** .DiFF 디렉토리에서 브랜치 내용 읽기 **/
export async function gg(){

    const isGitDirectory = execSync('[ -d .git ] && echo true || echo false').toString().trim();

    if(isGitDirectory === 'false') {
        console.log('fatal: not a git repository (or any of the parent directories): .git');
    }
    return isGitDirectory;
}

/**  **/


/**  **/