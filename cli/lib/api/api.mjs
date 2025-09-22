import axios from "axios";
import { getGitEmail } from "../git/simpleGit.mjs";
import chalk from "chalk";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

const BASE_URL = "https://api.diff.io.kr/api/DiFF";

// ---------- 📌 R2 Client ----------


// 📦 R2 업로드 함수
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
// ---------- 📌 Git User 확인 ----------
export async function verifyGitUser() {
    const email = await getGitEmail();
    if (!email) return null;

    try {
        const { data } = await axios.post(`${BASE_URL}/draft/verifyGitUser`, { email });
        return data.resultCode.startsWith("S-") ? data.data1 : null;
    } catch {
        return null;
    }
}

// ---------- 📌 Repo Name 확인 ----------
export async function isUsableRepoName(memberId, repoName) {
    const { data } = await axios.post(`${BASE_URL}/draft/isUsableRepoName`, {
        memberId,
        repoName,
    });
    return data.data1;
}

// ---------- 📌 Repo DB 생성 ----------
export async function mkRepo(memberId, repoName, commitHash) {
    const { data } = await axios.post(`${BASE_URL}/draft/mkRepo`, {
        memberId,
        repoName,
        firstCommit: commitHash,
    });

    if (data.resultCode.startsWith("S-")) {
        return data.data1;
    } else {
        console.log(chalk.yellow("⚠️ Repository name already in use."));
        return null;
    }
}

// ---------- 📌 Diff 저장 ----------
export async function sendDiFF(memberId, repositoryId, draftId, diffId, checksum, diff) {
    try {
        const { data } = await axios.post(`${BASE_URL}/draft/receiveDiff`, {
            memberId,
            repositoryId,
            draftId,
            diffId,
            lastChecksum: checksum,
            diff,
        });

        console.log("✅ server에 diff 보내기 성공:", data.msg);

        return data.resultCode?.startsWith("S-") ? true : false;
    } catch {
        return false;
    }
}

// ---------- 📌 Draft 메타데이터 전달 (ZIP 업로드 후 호출) ----------
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
