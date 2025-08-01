import chalk from 'chalk';
import simpleGit from 'simple-git';

const git = simpleGit();

/** git config email **/
export async function getGitEmail() {
    try {
        const configList = await git.listConfig();
        const email = configList.all['user.email'];

        if (!email) {
            return null;
        }

        return email;

    } catch (err) {
        console.error(chalk.red('\n' + 'Failed to get git email'));
        return null;
    }
}

/** git remote repository url **/
export async function getRemoteUrl() {
    try {
        const remotes = await git.getRemotes(true); // true → remote URL 포함
        const origin = remotes.find(remote => remote.name === 'origin');
        return origin?.refs?.fetch || null;
    } catch (err) {
        console.error("Failed to get remote URL:", err.message);
        return null;
    }
}
