import chalk from 'chalk';
import axios from 'axios';

import {getGitEmail} from "../git/simpleGit.mjs";

/** diff member check **/
export async function verifyGitUser() {
    // console.log('🚀 Verifying Git user...');
    const email = await getGitEmail();

    if(email === null) {
        // console.error(chalk.red('Git email not configured.'));
        return null;
    }
    // console.log(chalk.bgCyanBright("email: ", email));

    try {
        const { data } = await axios.post(
            'http://13.124.33.233:8080/api/DiFF/draft/verifyGitUser', {
                email
            });
        // console.log(chalk.bgCyanBright(chalk.black(data.data1)));

        if (data.resultCode.startsWith('S-')) { // 인증 성공
            return data.data1; // memberId 리턴

        } else { // 인증 실패
            // console.log(chalk.red("You can use Diff after join"));
            return null;
        }
    } catch (err) {
        // console.error(chalk.red('error:'), err.message);
        return null;
    }
}

/** repository name check **/
export async function isUsableRepoName(memberId, repoName){

    const { data } = await axios.post(
        'http://13.124.33.233:8080/api/DiFF/draft/isUsableRepoName', {
            memberId: memberId,
            repoName: repoName
        });
    return data.data1;
}

/** insert repository DB **/
export async function mkRepo(memberId, repoName, commitHash){

    const { data } = await axios.post(
        'http://13.124.33.233:8080/api/DiFF/draft/mkRepo', {
            memberId: memberId,
            repoName: repoName,
            firstCommit: commitHash
        });

    if (data.resultCode.startsWith('S-')) {
        return data.data1;

    } else {
        console.log("This repository name is already in use.");
        return null;
    }
}

export async function sendDiFF(memberId, repositoryId, draftId, diffId, checksum, diff) {
    try {
        const { data } = await axios.post(
            "http://13.124.33.233:8080/api/DiFF/draft/receiveDiff",
            {
                memberId,
                repositoryId,
                draftId,
                diffId,
                lastChecksum: checksum,
                diff,
            }
        );

        if (data.resultCode?.startsWith("S-")) {
            // console.log("✅ server에 diff 보내기 성공:", data.msg);
            return true;
        } else {
            // console.error("❌ server에 diff 보내기 실패:", data.msg);
            return false;
        }
    } catch (error) {
        // console.error("⚠️ sendDiFF 중 오류:", error.message);
        return false;
    }
}
