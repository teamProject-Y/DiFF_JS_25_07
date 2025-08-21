import chalk from 'chalk';
import axios from 'axios';

import {getGitEmail} from "../git/simpleGit.mjs";

/** diff member check **/
export async function verifyGitUser() {

    const email = await getGitEmail();

    if(email === null) {
        console.error(chalk.red('Git email not configured.'));
        return null;
    }

    console.log(chalk.bgCyanBright("email: ", email));

    try {
        const { data } = await axios.post(
            'http://localhost:8080/api/DiFF/draft/verifyGitUser', {
                email
            });
        console.log(chalk.bgCyanBright(chalk.black(data.data1)));

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
        'http://localhost:8080/api/DiFF/draft/isUsableRepoName', {
            memberId: memberId,
            repoName: repoName
        });

    return data.data1;
}

/** insert repository DB **/
export async function mkRepo(memberId, repoName, commitHash){

    const { data } = await axios.post(
        'http://localhost:8080/api/DiFF/draft/mkRepo', {
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


/** 서버에 diff 보내기 **/
export async function sendDiFF(memberId, repositoryId, to, diff) {
    try {
        console.log(chalk.bgCyanBright("sendDiFF"));
        const { data } = await axios.post(
            'http://localhost:8080/api/DiFF/draft/mkDraft',
            {
                memberId,
                repositoryId,
                lastChecksum: to,
                diff
            }
        );

        if (data.resultCode?.startsWith('S-')) {

            console.log(chalk.bgCyanBright(chalk.black("server에 diff 보내기 성공")));

            return true;
        } else {
            console.log(chalk.bgRedBright(chalk.white(data.msg)));
            console.log('서버 응답 데이터:', data);
            return false;
        }

    } catch (error) {
        console.log(chalk.bgRedBright(chalk.white("server에 diff 전달 중 오류 발생")));

        if (error.response) {
            console.error('📡 status:', error.response.status);
            console.error('📄 data:', error.response.data);
        } else if (error.request) {
            console.error('❓ no response received');
            console.error(error.request);
        } else {
            // 요청 자체 세팅 중 오류
            console.error('⚠️ axios 설정 문제:', error.message);
        }

        return false;
    }
}