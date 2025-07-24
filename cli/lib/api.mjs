import chalk from 'chalk';
import axios from 'axios';

/** 등록된 멤버인지 확인 **/
export async function verifyGitUser(email) {
    try {
        let userVerifyRQ = await axios.post(
            'http://localhost:8080/usr/member/verifyGitUser', {
                email: email
            });
        let RD = userVerifyRQ.data;

        if (RD.resultCode.startsWith('S-')) { // 인증 성공
            return RD.data1; // memberId 리턴

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

export async function mkRepository(memberId, repoName, commitHash){

    const { data } = await axios.post(
        'http://localhost:8080/usr/draft/mkRepo', {
            memberId: memberId,
            repoName: repoName,
            firstCommit: commitHash
        });

    return data.data1;
}