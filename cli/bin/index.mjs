#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import axios from 'axios';
import { execSync } from 'child_process';
import { simpleGit } from 'simple-git';
const git = simpleGit();
// import readline from 'readline/promises';
// import { stdin as input, stdout as output } from 'node:process';

import { getGitEmail } from '../lib/gitUtils.mjs';
import {verifyGitUser, isUsableRepoName, mkDraft} from '../lib/api.mjs';
import {existsGitDirectory, existsDiFF, DiFFinit, mkZip} from '../lib/execSync.mjs';

const program = new Command();

async function getLastCommit(memberId, branch) {
    try {

        // Diff 파일 존재 여부 확인
        let DiFFexists = await existsDiFF();

        if(DiFFexists === 'true') {

        }else {

            // repo 이름 입력 받기
            console.log(' Your repository isn\'t connected.');
            let repoName = q.ask(' Please enter your new DiFF repository name: ');

            // repo 이름 중복인지 확인하기
            let usable = await isUsableRepoName(repoName);
            while(!usable){
                repoName = await q.ask(' This repository name is already in use. Try a different one: ');
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

            console.log("", makeRepoRQ.data);

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
    .option('--no-filename', '파일명 제외')
    .option('--full-code', '변경 전 코드 포함') // 보류
    .option('--last-only', '첫커밋과 마지막 커밋만 추적')
    // 분석 제외
    .action(async (branch, options) => {

        /** 선택된 브랜치 **/
        const selectedBranch = branch;

        // const log = await git.log({ n: 1 });
        // const latestCommit = log.latest;
        // const diff = await git.diff([`${latestCommit.hash}^!`]);

        console.log(chalk.bgYellow("selectedBranch: ", selectedBranch));
        const zip = mkZip(selectedBranch);
        if(zip === false){
            console.log("zip error");
            process.exit(1);
        }else {
            console.log("zip success");
        }
        /** git repo 여부 **/
        const checkIsRepo = await existsGitDirectory();
        if(checkIsRepo === 'false') {
            process.exit(1);
            console.log(chalk.bgYellow("checkIsRepo: ", checkIsRepo));
        }
        console.log(chalk.bgYellow("checkIsRepo: ", checkIsRepo));

        /** 이메일 가져오기 **/
        const email = await getGitEmail();
        if (email === null) {
            console.log(chalk.bgYellow("email not found"));
            process.exit(1);
        }
        console.log(chalk.bgYellow("email :",  email));

        /** git 설정 이메일, DiFF 회원 이메일 체크 **/
        const memberId = await verifyGitUser(email);
        if (memberId === null) {
            console.log(chalk.bgYellow("memberId not found"));
            process.exit(1);
        }
        console.log("memberId :",  memberId);

        /** DiFF 디렉토리 존재 여부 **/
        const isDiFF = await existsDiFF();

        let firstChecksum;
        if(isDiFF === 'true'){
            console.log(chalk.bgYellow("DiFF is exists"))
            // 파일에서 마지막 요청커밋 가져오기
        } else {
            console.log(chalk.bgYellow('DiFF is not exists'));
            firstChecksum = await DiFFinit(memberId, branch);
            if(firstChecksum === null) {
                console.log(chalk.red("뭔가 문제 있음"))
                process.exit(1);
            }
        }

        await mkDraft(memberId, branch, firstChecksum);
        console.log(chalk.bgYellow("draft successfully"));


        // console.log('Making to draft...');
        // console.log('*', chalk.green(branch));
        // console.log('Options:', options);
        // console.log('done.');
    });

program.parse();
