import fs from "fs";
import path from "path";
import {getRemoteUrl} from "../git/simpleGit.mjs";

/** DiFF 디렉토리 만들기 **/
export async function mkDiFFdirectory(repositoryId) {
    if (fs.existsSync(".DiFF")) return;

    createDiFFRoot();
    await createConfigFile(repositoryId);
    // createMetaFile(branches);
    // createBranchLogs(branches);
}


/** 브랜치 생성 순 반환 **/
export async function getBranchCreationTimes() {
    const dir = ".git/logs/refs/heads";
    const branches = fs.readdirSync(dir);
    const result = [];

    for (const branch of branches) {
        const content = fs.readFileSync(path.join(dir, branch), "utf-8");
        const firstLine = content.split("\n")[0];
        const parts = firstLine.split(" ");

        const fromHash = parts[0];
        const toHash = parts[1];
        const timestamp = parseInt(parts[4], 10);
        const event = firstLine.split('\t')[1];

        result.push({ branch, timestamp, fromHash, toHash, event });
    }

    result.sort((a, b) => a.timestamp - b.timestamp);
    return result;
}

function createDiFFRoot() {
    fs.mkdirSync(".DiFF");
    fs.mkdirSync(".DiFF/branches");
}

async function createConfigFile(repositoryId) {

    const repositoryUrl = await getRemoteUrl();

    const config = {
        repositoryId,
        repositoryUrl
    };

    fs.writeFileSync(".DiFF/config", JSON.stringify(config, null, 2));
}

function createMetaFile(branches) {
    const meta = branches.map(branch => ({
        branchName: branch,
        branchId: generateBranchId(branch),
        lastRequestedCommit: null,
        lastRequestedAt: null,
        requestCount: 0
    }));
    fs.writeFileSync(".DiFF/meta", JSON.stringify(meta, null, 2));
}

function createBranchLogs(branches) {
    for (const branch of branches) {
        fs.writeFileSync(`.DiFF/branches/${branch}.json`, "[]");
    }
}

function generateBranchId(branchName) {
    // 간단한 ID 생성 (원하면 uuid도 가능)
    return `branch-${branchName}-${Date.now()}`;
}
