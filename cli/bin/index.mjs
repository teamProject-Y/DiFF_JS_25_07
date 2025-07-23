#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import axios from 'axios';
import { execSync } from 'child_process';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const program = new Command();

// 사용자 입력 함수
const rl = readline.createInterface({ input, output });

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
        let userVerifyRQ = await axios.post(
            'http://localhost:8080/usr/member/verifyGitUser', {
                email: email
        });
        let RD = userVerifyRQ.data;

        if (RD.resultCode.startsWith('S-')) { // 인증 성공
            return RD.data1; // memberId 리턴

        } else { // 인증 실패
            console.log(chalk.red("error: you can use Diff after join"));
            return null;
        }
    } catch (err) {
        console.error(chalk.red('error:'), err.message);
        return null;
    }
}

// 현재 리포가 DB에 저장되어 있다면 마지막 커밋 가져오기
// 저장되어 있지 않다면 리포, 마지막 커밋 저장 / .DiFF 파일 만들기
async function getLastCommit(memberId) {
    try {
        let DiFFexists = execSync('[ -f .DiFF ] && echo true || echo false').toString().trim();
        console.log(memberId);

        if(DiFFexists === 'true') { // 연결 되어 있음

            // const res = await axios.post(
            //     'http://localhost:8080/usr/member/verifyGitUser', {
            //        memberId: memberId
            //         // .diff 의 내용, member id 전달
            //     });

        }else { // 연결 안되어 있음

            console.log(chalk.red('Your repository isn\'t connected.'));
            const repoName = await rl.question('Please enter your new DiFF repository name: ');

            // 서버에 리포 생성 요청, id 반환
            // let makeRepoRQ = await axios.post(
            //     'http://localhost:8080/usr/member/verifyGitUser', {
            //         memberId: memberId,
            //         repoName: repoName
            //     });

            // .DiFF 파일 생성
            execSync('touch .DiFF');

            // id, 첫번째 커밋 체크섬 .DiFF에 저장

        }
        rl.close();

    } catch (err) {
        console.error(chalk.red('error:'), err.message);
        return false;
    }
}

// git login Email 가져오기
async function getGitLog() {
    try {
        const logCount = execSync('git config user.email').toString().trim();
        return logCount;
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

        const memberId = await verifyGitUser(email);
        if (memberId === null) {
            console.error(chalk.red(`You are an unregistered user: ${email}`));
            process.exit(1);
        }
        console.log('User authentication completed');

        const DiFF = await getLastCommit(memberId);

        console.log('Making to draft...');
        // console.log('*', chalk.green(branch));
        console.log('Options:', options);
        // console.log('done.');
    });

program.parse();
