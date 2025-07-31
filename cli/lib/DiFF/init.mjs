import fs from "fs";
import path from "path";
import {getRemoteUrl} from "../git/simpleGit.mjs";
import {DateTime} from "luxon";

/** DiFF 디렉토리 만들기 **/
export async function mkDiFFdirectory(repositoryId) {
    if (fs.existsSync(".DiFF")) return;

    const branches = await getBranchCreationTimes();

    createDiFFRoot();
    await createConfigFile(repositoryId);
    await createMetaFile();

    branches.forEach((branch, index) => {
        appendMeta(branch, index === 0);
        createBranchLog(branch.name);
    });
}

/** 브랜치 생성 순 반환 **/
async function getBranchCreationTimes() {
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

        result.push({ name: branch, timestamp: timestamp, fromHash: fromHash, toHash: toHash, event: event });
    }

    result.sort((a, b) => a.timestamp - b.timestamp);
    return result;
}

function createDiFFRoot() {
    fs.mkdirSync(".DiFF");
    fs.mkdirSync(".DiFF/logs");
}

async function createConfigFile(repositoryId) {
    const repositoryUrl = await getRemoteUrl();

    const config = {
        repositoryId,
        repositoryUrl,
        createdAt: DateTime.local().toISO()
    };

    fs.writeFileSync(".DiFF/config", JSON.stringify(config, null, 2));
}

// function createMetaFile(branches) {
//     const meta = branches.map((branch, index) => ({
//         branchName: branch.name,
//         root: index === 0,
//         // branchId: generateBranchId(branch),
//         createdAt: DateTime.local().toISO(),
//         lastRequestedCommit: branch.toHash,
//         lastRequestedAt: null,
//         requestCount: 0
//     }));
//     fs.writeFileSync(".DiFF/meta", JSON.stringify(meta, null, 2));
// }

function createMetaFile() {
    fs.writeFileSync(".DiFF/meta", JSON.stringify([], null, 2));
}

function appendMeta(branch, isRoot = false) {
    const newEntry = {
        branchName: branch.name,
        root: isRoot,
        createdAt: DateTime.local().toISO(),
        lastRequestedCommit: branch.toHash,
        lastRequestedAt: null,
        requestCount: 0
    };

    const metaPath = ".DiFF/meta";
    const current = fs.existsSync(metaPath)
        ? JSON.parse(fs.readFileSync(metaPath, "utf-8"))
        : [];

    current.push(newEntry);
    fs.writeFileSync(metaPath, JSON.stringify(current, null, 2));
}

function createBranchLogs(branches) {
    for (const branch of branches) {
        fs.writeFileSync(`.DiFF/logs/${branch}.json`, "[]");
    }
}

function createBranchLog(branchName) {

    const logsDir = ".DiFF/logs";
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true }); // 상위부터 생성
    }

    const logPath = path.join(logsDir, `${branchName}.json`);
    fs.writeFileSync(logPath, "[]");
}

