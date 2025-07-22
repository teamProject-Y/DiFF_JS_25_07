#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import axios from 'axios';
import { execSync } from 'child_process';

const program = new Command();

// git login Email 가져오기
async function getGitEmail() {
    try {
        const email = execSync('git config user.email').toString().trim();
        return email;
    } catch (err) {
        console.error(chalk.red('\n' + 'You can use it after login to git'));
        return null;
    }
}

// 등록된 멤버인지 확인
async function verifyGitUser(email) {

    try {
        const userVerifyRD = await axios.post(
            'http://localhost:8080/usr/member/verifyGitUser', {
                email: email
        });

        let RD = userVerifyRD.data;

        if (RD.resultCode.startsWith('S-')) {
            console.log("user verifying successful");
            return true; // 인증 성공
        } else {
            console.log(chalk.red("error: you can use Diff after join"));
            return false; // 인증 실패
        }
    } catch (err) {
        // console.log(chalk.red("user verifying failed"));
        console.error(chalk.red('error:'), err.message);
        return false;
    }
}

// 현재 리포가 DB에 저장되어 있다면 마지막 커밋 가져오기
// 저장되어 있지 않다면 리포, 마지막 커밋 저장 / .DiFF 파일 만들기
async function getLastCommit() {
    try {
        let DiFFexists = execSync('[ -f .DiFF ] && echo true || echo false').toString().trim();

        if(DiFFexists) {

        }else {
            console.log(chalk.red('Your repository isn\'t connected.'));

        }

        const res = await axios.post(
            'http://localhost:8080/usr/member/verifyGitUser', {
                // .diff 의 내용, member id 전달
            });
        return res.data.verified;
    } catch (err) {
        console.error(chalk.red('error:'), err.message);
        return false;
    }
}



// git login Email 가져오기
async function getGitLog() {
    try {
        const logCount = execSync('git config user.email').toString().trim();
        return email;
    } catch (err) {
        console.error(chalk.red('\n' + 'You can use it after login to git'));
        return null;
    }
}


program
    .name("git-mkdraft")
    .description("Git 커밋 기반 블로그 초안 생성 CLI")
    .argument('<branch>', '분석할 브랜치 이름')
    .option('--no-title', '제목 제외')
    .option('--no-filename', '파일명 제외')
    .option('--full-code', '변경 전 코드 포함')
    .option('--last-only', '첫커밋과 마지막 커밋만 추적')
    .action(async (branch, options) => {

        console.log(`\nGit user verfying...`);

        const email = await getGitEmail();
        if (!email) {
            console.error(chalk.red('Git user email not found.'));
            process.exit(1);
        }

        const verified = await verifyGitUser(email);
        if (!verified) {
            console.error(chalk.red(`You are an unregistered user: ${email}`));
            process.exit(1);
        }

        console.log('User authentication completed');

        console.log('Making to draft...');
        // console.log('*', chalk.green(branch));
        console.log('Options:', options);
        // console.log('done.');
    });

program.parse();
