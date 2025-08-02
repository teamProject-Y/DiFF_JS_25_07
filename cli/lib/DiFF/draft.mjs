import {getDiFF, getLastChecksum} from "../git/execSync.mjs";
import {execSync} from "child_process";
import {sendDiFF} from "../api/api.mjs";
import fs from 'fs';
import fsp from 'fs/promises';
import {DateTime} from "luxon";
import chalk from "chalk";
import {appendMeta} from "./init.mjs";
import path from "path";

export async function mkDraft(memberId, branch) {

    const from = await getLastRequestChecksum(branch);
    const to = await getLastChecksum(branch);
    const diff = await getDiFF(from, to);

    if (!diff || diff.trim().length === 0) {
        console.log(chalk.bgRedBright(chalk.black("diff 내용이 비어있습니다.")));
        return null;
    }

    const getDraft = await sendDiFF(memberId, to, diff);
    if(getDraft){
        await updateMeta(branch, to);
        await appendLogs(branch, from, to);

    }
}

/** meta 마지막 체크섬 업데이트 **/
export async function updateMeta(branchName, lastChecksum) {
    try {
        const content = await fsp.readFile('.DiFF/meta', 'utf-8');
        const meta = JSON.parse(content);

        const branch = meta.find(b => b.branchName === branchName);
        if (!branch) {
            console.log(chalk.bgBlueBright(`meta에 branch가 존재하지 않아 새로 생성합니다.`));
            await appendMeta({ name: branchName, toHash: lastChecksum });
        }

        branch.lastRequestedCommit = lastChecksum;
        branch.lastRequestedAt = DateTime.local().toISO();
        branch.requestCount = (branch.requestCount || 0) + 1;

        await fsp.writeFile('.DiFF/meta', JSON.stringify(meta, null, 2), { encoding: 'utf-8' });
    } catch (err) {
        console.log(chalk.bgRedBright(`메타 업데이트 실패: ${err.message}`));
        throw err;
    }
}

/** logs 업데이트 **/
export async function appendLogs(branch, from, to) {
    const logPath = `.DiFF/logs/${branch}.json`;

    let logs = [];

    // 1. 파일이 이미 존재한다면 내용 읽기
    try {
        const content = await fsp.readFile(logPath, 'utf-8');
        logs = JSON.parse(content);
    } catch (err) {
        if (err.code === 'ENOENT') {
            logs = [];
        } else {
            throw err;
        }
    }

    // 2. 새 로그 추가
    logs.push({
        requestAt: DateTime.local().toISO(),
        from,
        to
    });

    // 3. 파일에 다시 쓰기
    await fsp.writeFile(logPath, JSON.stringify(logs, null, 2), { encoding: 'utf-8' });
}

/** .DiFF 디렉토리에서 브랜치 내용 읽기 **/
export async function getLastRequestChecksum(branch){

    const DiFFexists = execSync('[ -d .DiFF ] && echo true || echo false').toString().trim();

    if(DiFFexists === 'false') {
        console.err('fatal: not a DiFF repository: .DiFF');
        return null;
    }
    const metaPath = '.DiFF/meta';
    if (!fs.existsSync(metaPath)) {
        console.err('fatal: .DiFF/meta not found');
        return null;
    }

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    const entry = meta.find(e => e.branchName === branch);

    if (!entry) {
        console.err(`no metadata found for branch: ${branch}`);
        return null;
    }

    return entry.lastRequestedCommit;
}