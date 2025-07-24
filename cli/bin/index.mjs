#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import axios from 'axios';
import { execSync } from 'child_process';
// import readline from 'readline/promises';
// import { stdin as input, stdout as output } from 'node:process';

import { getGitEmail } from '../lib/gitUtils.mjs';
import { verifyGitUser, isUsableRepoName } from '../lib/api.mjs';
import { getResponse } from "../lib/promft.mjs";
import { existsGitDirectory, existsDiFF } from '../lib/execSync.mjs';

const program = new Command();
const q = await getResponse();

// 사용자 입력 함수
// const rl = readline.createInterface({ input, output });

// git login Email 가져오기
// async function getGitEmail() {
//     try {
//         const email = execSync('git config user.email').toString().trim();
//         return email;
//     } catch (err) {
//         console.error(chalk.red('\n' + 'You can use it after login to git'));
//         return null;
//     }
// }

// // 등록된 멤버인지 확인
// async function verifyGitUser(email) {
//     try {
//         let userVerifyRQ = await axios.post(
//             'http://localhost:8080/usr/member/verifyGitUser', {
//                 email: email
//         });
//         let RD = userVerifyRQ.data;
//
//         if (RD.resultCode.startsWith('S-')) { // 인증 성공
//             return RD.data1; // memberId 리턴
//
//         } else { // 인증 실패
//             console.log(chalk.red("error: you can use Diff after join"));
//             return null;
//         }
//     } catch (err) {
//         console.error(chalk.red('error:'), err.message);
//         return null;
//     }
// }

// 현재 리포가 DB에 저장되어 있다면 마지막 커밋 가져오기
// 저장되어 있지 않다면 리포, 마지막 커밋 저장 / .DiFF 파일 만들기
async function getLastCommit(memberId, branch) {
    try {

        // git repository 여부 확인
        // let gitExists = execSync('[ -d .git ] && echo true || echo false').toString().trim();
        // if(gitExists === 'false') {
        //     console.log('fatal: not a git repository (or any of the parent directories): .git');
        //     return null;
        // }

        // Diff 파일 존재 여부 확인
        let DiFFexists = await existsDiFF();

        if(DiFFexists === 'true') {

            // const res = await axios.post(
            //     'http://localhost:8080/usr/draft/verifyGitUser', {
            //        memberId: memberId
            //         // .diff 의 내용, member id 전달
            //     });

        }else {

            // repo 이름 입력 받기
            console.log(' Your repository isn\'t connected.');
            let repoName = q.ask(' Please enter your new DiFF repository name: ');

            // repo 이름 중복인지 확인하기
            let usable = await isUsableRepoName(repoName);
            while(!usable){
                repoName = q.ask(' This repository name is already in use. Try a different one: ');
                usable = await isUsableRepoName(repoName);
            }

            // 첫 커밋 가져오기
            let firstCommit = execSync(`git log --reverse ${branch} --oneline | head -n 1`)
                .toString().trim();

            const commitHash = firstCommit.split(' ')[0];
            const commitMessage = firstCommit.split(' ').slice(1).join(' ');

            console.log(commitHash);
            console.log(commitMessage);
            console.log("memberID: " + memberId);

            // 서버에 리포 생성 요청, id 반환
            let makeRepoRQ = await axios.post(
                'http://localhost:8080/usr/draft/mkRepo', {
                    memberId: memberId,
                    repoName: repoName,
                    firstCommit: commitHash
                });

            console.log(makeRepoRQ.data);

            // .DiFF 디렉토리 생성
            execSync('mkdir .DiFF');

            // id, 첫번째 커밋 체크섬 .DiFF에 저장


            q.close();

            return commitHash;
        }

    } catch (err) {
        console.error(chalk.red('error:'), err.message);
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

        /** 선택된 브랜치 **/
        const selectedBranch = branch;

        /** git repo 여부 **/
        const checkIsRepo = await existsGitDirectory();
        if(checkIsRepo === 'false') {
            process.exit(1);
        }
        //console.log(`\nGit user verfying...`);

        /** 이메일 가져오기 **/
        const email = await getGitEmail();
        if (email === null) {
            process.exit(1);
        }

        /** git 설정 이메일, DiFF 회원 이메일 체크 **/
        const memberId = await verifyGitUser(email);
        if (memberId === null) {
            process.exit(1);
        }
        // console.log('User authentication completed');

        const DiFF = await getLastCommit(memberId, branch);
        if(DiFF === null){
            process.exit(1);
        }

        console.log('Making to draft...');
        // console.log('*', chalk.green(branch));
        console.log('Options:', options);
        // console.log('done.');
    });

program.parse();
