import fs from 'node:fs';
import path from "node:path";
import {getRemoteUrl} from "../git/simpleGit.mjs";
import {DateTime} from "luxon";

/** DiFF 디렉토리 만들기 **/
export async function mkDiFFdirectory(repositoryId) {

    const branches = await getBranchCreationTimes();

    await createDiFFRoot();
    await createConfigFile(repositoryId);
    await createMetaFile();

    for (const branch of branches) {
        const index = branches.indexOf(branch);
        await appendMeta(branch, index === 0);
        await createBranchLog(branch.name);
    }
}

/** directory 생성 **/
async function createDiFFRoot() {
    fs.mkdirSync(".DiFF", { recursive: true });
    fs.mkdirSync(".DiFF/logs", { recursive: true });
}

/** config file 생성, 작성 **/
async function createConfigFile(repositoryId) {
    const repositoryUrl = await getRemoteUrl();

    const config = {
        repositoryId,
        repositoryUrl,
        createdAt: DateTime.local().toISO()
    };

    fs.writeFileSync(".DiFF/config", JSON.stringify(config, null, 2));
}

/** meta file 생성 **/
async function createMetaFile() {
    const metaPath = ".DiFF/meta";
    if (!fs.existsSync(metaPath)) {
        fs.writeFileSync(metaPath, JSON.stringify([], null, 2));
    }
}

/** 브랜치 생성 순 반환 **/
async function getBranchCreationTimes() {

    const headsRoot = path.join(".git", "logs", "refs", "heads");

    if (!fs.existsSync(headsRoot) || !fs.statSync(headsRoot).isDirectory()) {
        return [];
    }

    function walkFiles(dir) {
        const out = [];
        for (const entry of fs.readdirSync(dir)) {
            const p = path.join(dir, entry);
            const st = fs.statSync(p);
            if (st.isDirectory()) {
                out.push(...walkFiles(p));                 
            } else if (st.isFile()) {
                out.push(p);                               
            }
            // 심볼릭 링크 등은 무시
        }
        return out;
    }

    const files = walkFiles(headsRoot);                    
    const result = [];

    for (const filePath of files) {
        const name = path.relative(headsRoot, filePath).replace(/\\/g, '/');

        const content = fs.readFileSync(filePath, "utf-8");

        const firstLine = (content.split("\n").find(Boolean) || "").trim();
        if (!firstLine) continue;

        const tsMatch = firstLine.match(/\s(\d{10})\s[+-]\d{4}\s*\t/);        
        const timestamp = tsMatch ? parseInt(tsMatch[1], 10) : NaN;           


        const parts = firstLine.split(/\s+/);
        const fromHash = parts[0] || null;                                    
        const toHash = parts[1] || null;                                      

        const tabIdx = firstLine.indexOf('\t');                                
        const event = tabIdx >= 0 ? firstLine.slice(tabIdx + 1) : "";          

        if (!Number.isNaN(timestamp)) {
            result.push({ name, timestamp, fromHash, toHash, event });
        } else {
            const st = fs.statSync(filePath);
            result.push({ name, timestamp: Math.floor(st.mtimeMs / 1000), fromHash, toHash, event }); 
        }
    }

    result.sort((a, b) => a.timestamp - b.timestamp);
    return result;
}

/** meta file에 브랜치 정보 추가 **/
export async function appendMeta(branch, isRoot = false) {
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

/** log 폴더, 브랜치.json 파일 생성 **/
async function createBranchLog(branchName) {

    const logsDir = ".DiFF/logs";
    if (!fs.existsSync(logsDir)) {
        return false;
    }

    const logPath = path.join(logsDir, `${branchName}.json`);
    
    if (!fs.existsSync(logPath)) {                         
        fs.mkdirSync(path.dirname(logPath), { recursive: true }); 
        fs.writeFileSync(logPath, "[]");
    }
}
