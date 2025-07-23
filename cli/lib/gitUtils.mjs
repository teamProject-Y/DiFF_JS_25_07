
const simpleGit = require('simple-git');
const git = simpleGit();

/** 전체 커밋 목록 가져오기 */
async function getCommitHashes() {
    const log = await git.log();
    return log.all.map(commit => commit.hash);
}

/** 마지막 커밋 1개 가져오기 */
async function getLastCommitHash() {
    const log = await git.log({ n: 1 });
    return log.latest.hash;
}

/** 커밋 사이 변경 내용 가져오기 */
async function getDiffBetweenCommits(fromHash, toHash, includeOld = false) {
    const diffOptions = includeOld ? [] : ['--unified=0'];
    const diff = await git.diff([...diffOptions, `${fromHash}..${toHash}`]);
    return diff;
}

module.exports = {
    getCommitHashes,
    getLastCommitHash,
    getDiffBetweenCommits
};
