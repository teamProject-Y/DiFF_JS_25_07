#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { simpleGit } from 'simple-git';
const git = simpleGit();

import { getGitEmail } from '../lib/gitUtils.mjs';
import {verifyGitUser, isUsableRepoName, mkDraft} from '../lib/api.mjs';
import {existsGitDirectory, existsDiFF, DiFFinit, mkZip, branchExists} from '../lib/execSync.mjs';

const program = new Command();

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
        console.log(chalk.bgYellow("selectedBranch: ", selectedBranch));

        /** 브랜치 존재 여부 **/
        const branchCheck = await branchExists(branch);
        console.log(branchCheck);
        if (branchCheck) {
            console.log(chalk.bgYellow("branchExists"));
        }else {
            console.log(chalk.bgYellow("branch is not exists"));
            process.exit(1);
        }

        const zip = mkZip(selectedBranch);
        if(zip === false){
            console.log(chalk.bgYellow("zip error"));
            process.exit(1);
        }else {
            console.log(chalk.bgYellow("zip success"));
        }
        /** git repo 여부 **/
        const checkIsRepo = await existsGitDirectory();
        if(checkIsRepo === 'false') {
            console.log(chalk.bgYellow("checkIsRepo: ", checkIsRepo));
            process.exit(1);
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
        console.log(chalk.bgYellow("memberId :",  memberId));

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
