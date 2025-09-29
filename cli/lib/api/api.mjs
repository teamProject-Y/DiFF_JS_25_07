import axios from "axios";
import { getGitEmail } from "../git/simpleGit.mjs";
import chalk from "chalk";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

const BASE_URL = "https://api.diff.io.kr/api/DiFF";

// R2 Client
const R2 = new S3Client({
    region: "auto",
    endpoint: "https://8a70679610ce7aae1dcb2a5c961d8356.r2.cloudflarestorage.com",
    credentials: {
        accessKeyId: "9e4b5b2e1f6594b84af60679d55d3dc0",
        secretAccessKey: "a0366a64de74ad8ca0686d5cd59f48259f09c552622ff12e6fb0b355e7066445",
    },
});

// R2 업로드 함수
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
// Git User 확인
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

// Repo Name 확인
export async function isUsableRepoName(memberId, repoName) {
    const { data } = await axios.post(`${BASE_URL}/draft/isUsableRepoName`, {
        memberId,
        repoName,
    });
    return data.data1;
}

// Repo DB 생성
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

// Diff 저장
export async function sendDiFF(memberId, repositoryId, draftId, diffId, checksum, diff) {
    const t0 = Date.now();
    const tag = (msg) => chalk.cyan(`[sendDiFF d:${draftId} diff:${diffId}] `) + msg;

    try {
        const payload = {
            memberId,
            repositoryId,
            draftId,
            diffId,
            lastChecksum: checksum,
            diff,
        };

        // 큰 DIFF를 대비해 axios 옵션 강화
        const { data, status } = await axios.post(
            `${BASE_URL}/draft/receiveDiff`,
            payload,
            {
                timeout: 1000 * 60 * 5,
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                headers: { "Content-Type": "application/json" },
            }
        );

        const ok = data?.resultCode?.startsWith("S-") ?? false;

        if (!ok && data) {
            // 서버가 에러 디테일을 실어줄 수 있으니 같이 찍기
            console.warn(tag(chalk.yellow(`⚠️ server data: ${JSON.stringify(data).slice(0, 800)}${JSON.stringify(data).length > 800 ? " …" : ""}`)));
        }

        const dt = ((Date.now() - t0) / 1000).toFixed(2);

        return ok;
    } catch (e) {
        const dt = ((Date.now() - t0) / 1000).toFixed(2);

        // axios 에러 상세
        const status = e?.response?.status;
        const resp = e?.response?.data;
        const msg = e?.message || String(e);

        console.error(tag(chalk.red(`❌ request failed: ${msg}`)));
        if (status) console.error(tag(chalk.red(`❌ status=${status}`)));
        if (resp) {
            const snippet = typeof resp === "string" ? resp.slice(0, 800) : JSON.stringify(resp).slice(0, 800);
            console.error(tag(chalk.red(`❌ response body: ${snippet}${snippet.length >= 800 ? " …" : ""}`)));
        }
        return false;
    }
}

// Draft 메타데이터 전달 (ZIP 업로드 후 호출)
export async function sendDraftMeta(memberId, repositoryId, draftId, diffId, checksum, zipKey) {
    try {
        const { data } = await axios.post(`${BASE_URL}/draft/receiveMeta`, {
            memberId,
            repositoryId,
            draftId,
            diffId,
            lastChecksum: checksum,
            zipKey,
        });

        return data.resultCode?.startsWith("S-") ? true : false;
    } catch (error) {
        console.error(chalk.red("❌ Draft 메타 전송 실패:"), error.message);
        return false;
    }
}
