import {getDiFF, getLastChecksum} from "../git/execSync.mjs";
import {execSync} from "child_process";
import {sendDiFF} from "../api/api.mjs";
import fs from "fs";

export async function mkDraft(memberId, branch) {

    const from = await getLastRequestChecksum(branch);
    const to = await getLastChecksum(branch);
    const diff = await getDiFF(from, to);

    if (!diff || diff.trim().length === 0) {
        console.log("diff 없어서 초안 안만들음");
        return;
    }

    await sendDiFF(memberId, to, diff);
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