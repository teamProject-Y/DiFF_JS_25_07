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
        console.error(chalk.red('Git 이메일을 불러올 수 없습니다.'));
        return null;
    }
}

// 등록된 멤버인지 확인
async function verifyGitUser(email) {
    try {
        const res = await axios.post(
            'http://localhost:8080/usr/member/verifyGitUser', {
            email
        });
        console.log(email);
        return res.data.verified;
    } catch (err) {
        console.error(chalk.red('서버 인증 요청 실패:'), err.message);
        return false;
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

        console.log(chalk.blue(`\nGit 사용자 인증 중...`));

        const email = await getGitEmail();
        if (!email) {
            console.error(chalk.red('Git 사용자 이메일을 찾을 수 없습니다.'));
            process.exit(1);
        }

        const verified = await verifyGitUser(email);
        if (!verified) {
            console.error(chalk.red(`등록되지 않은 사용자입니다: ${email}`));
            process.exit(1);
        }

        console.log(chalk.green(`인증된 사용자: ${email}\n`));

        console.log("Making to draft...");
        // console.log('*', chalk.green(branch));
        console.log('Options:', options);
        console.log('done.');
    });

program.parse();
