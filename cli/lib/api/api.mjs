import chalk from 'chalk';
import axios from 'axios';

/** 등록된 멤버인지 확인 **/
export async function verifyGitUser(email) {
    try {
        const { data } = await axios.post(
            'http://localhost:8080/usr/draft/verifyGitUser', {
                email
            });
        console.log(chalk.bgCyanBright(chalk.black(data)));

        if (data.resultCode.startsWith('S-')) { // 인증 성공
            return data.data1; // memberId 리턴

        } else { // 인증 실패
            console.log(chalk.red("You can use Diff after join"));
            return null;
        }
    } catch (err) {
        console.error(chalk.red('error:'), err.message);
        return null;
    }
}

/** repository name check **/
export async function isUsableRepoName(memberId, repoName){

    const { data } = await axios.post(
        'http://localhost:8080/usr/draft/isUsableRepoName', {
            memberId: memberId,
            repoName: repoName
        });

    return data.data1;
}

export async function mkRepo(memberId, repoName, commitHash){

    const { data } = await axios.post(
        'http://localhost:8080/usr/draft/mkRepo', {
            memberId: memberId,
            repoName: repoName,
            firstCommit: commitHash
        });

    if (data.resultCode.startsWith('S-')) { // 인증 성공
        return data.data1; // memberId 리턴

    } else { // 인증 실패
        console.log("This repository name is already in use.");
        return null;
    }
}

export async function mkDraft(memberId, branch, firstChecksum){
    const lastChecksum = getLastChecksum(branch);
    const diff = getDiFF(firstChecksum, lastChecksum);
    const { data } = await axios.post(
        'http://localhost:8080/usr/draft/receiveDiff', {
            memberId: memberId,
            lastChecksum: lastChecksum,
            diff: diff
        });

    if(data.resultCode.startsWith('S-')) {
        console.log(chalk.bgCyanBright(chalk.black("server에 diff 보내기 성공")));
        return true;
    }else {
        console.log(chalk.bgCyanBright(chalk.black("server에 diff 보내기 실패")));
        return false;
    }
}