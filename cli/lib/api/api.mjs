import axios from 'axios';

import {getGitEmail} from "../git/simpleGit.mjs";
import chalk from "chalk";

/** diff member check **/
export async function verifyGitUser() {
    const email = await getGitEmail();

    if(email === null) {
        console.error(chalk.red('Git email not configured.'));
        return null;
    }

    try {
        const { data } = await axios.post(
            'http://44.206.130.144:8080/api/DiFF/draft/verifyGitUser', {
                email
            });

        if (data.resultCode.startsWith('S-')) {
            return data.data1;

        } else {
            console.error(chalk.red('Failed to verify git user.'));
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
        'http://44.206.130.144:8080/api/DiFF/draft/isUsableRepoName', {
            memberId: memberId,
            repoName: repoName
        });
    return data.data1;
}

/** insert repository DB **/
export async function mkRepo(memberId, repoName, commitHash){

    const { data } = await axios.post(
        'http://44.206.130.144:8080/api/DiFF/draft/mkRepo', {
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
            "http:/44.206.130.144:8080/api/DiFF/draft/receiveDiff",
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
            return true;
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
}
