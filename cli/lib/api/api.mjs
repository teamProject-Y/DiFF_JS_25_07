import axios from "axios";
import { getGitEmail } from "../git/simpleGit.mjs";
import chalk from "chalk";
import fs from "fs";

const BASE_URL = "https://api.diff.io.kr/api/DiFF"

const R2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY,
    },
});

export async function uploadZipToR2(filePath, key) {
    try {
        const fileStream = fs.createReadStream(filePath);

        const result = await R2.send(
            new PutObjectCommand({
                Bucket: "diff",
                Key: key,
                Body: fileStream,
            })
        );
        return true;
    } catch (err) {
        console.error("❌ [UPLOAD FAIL] 업로드 중 오류 발생:", err.message);
        return false;
    }
}
/** diff member check **/
export async function verifyGitUser() {
    const email = await getGitEmail();

    if (email === null) {
        return null;
    }

    try {
        const { data } = await axios.post(`${BASE_URL}/draft/verifyGitUser`, {
            email,
        });

        return data.resultCode.startsWith("S-") ? data.data1 : null;
    } catch (err) {
        return null;
    }
}

/** repository name check **/
export async function isUsableRepoName(memberId, repoName) {
    const { data } = await axios.post(`${BASE_URL}/draft/isUsableRepoName`, {
        memberId,
        repoName,
    });
    return data.data1;
}

/** insert repository DB **/
export async function mkRepo(memberId, repoName, commitHash) {
    const { data } = await axios.post(`${BASE_URL}/draft/mkRepo`, {
        memberId,
        repoName,
        firstCommit: commitHash,
    });

    if (data.resultCode.startsWith("S-")) {
        return data.data1;
    } else {
        console.log("This repository name is already in use.");
        return null;
    }
}

/** send diff **/
export async function sendDiFF(
    memberId,
    repositoryId,
    draftId,
    diffId,
    checksum,
    diff
) {
    try {
        const { data } = await axios.post(`${BASE_URL}/draft/receiveDiff`, {
            memberId,
            repositoryId,
            draftId,
            diffId,
            lastChecksum: checksum,
            diff,
        });

        return data.resultCode?.startsWith("S-") ? true : false;
    } catch (error) {
        return false;
    }
}

export async function sendDraftMeta(memberId, repositoryId, draftId, diffId, checksum, zipKey) {
    try {
        const { data } = await axios.post(`${BASE_URL}/draft/receiveMeta`, {
            memberId,
            repositoryId,
            draftId,
            diffId,
            lastChecksum: checksum,
            zipKey, // R2에 저장된 ZIP 파일 이름
        });

        return data.resultCode?.startsWith("S-") ? true : false;
    } catch (error) {
        console.error(chalk.red("❌ Draft 메타 전송 실패:"), error.message);
        return false;
    }
}