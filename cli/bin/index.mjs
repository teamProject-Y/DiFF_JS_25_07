#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { simpleGit } from 'simple-git';

import { getGitEmail } from '../lib/gitUtils.mjs';
import {verifyGitUser, isUsableRepoName, mkDraft} from '../lib/api.mjs';
import {
    existsGitDirectory,
    existsDiFF,
    DiFFinit,
    mkZip,
    branchExists, getBranchCreationTimes
} from '../lib/execSync.mjs';

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

        // const branches = await getFirstCommitOfBranch(branch);
        // console.log(branches);

        const firstBranch = await getBranchCreationTimes();
        // branch, timestamp, fromHash, toHash, event
        console.log(`${firstBranch[0].branch}  
        from: ${firstBranch[0].fromHash}
        to: ${firstBranch[0].toHash}
        event: ${firstBranch[0].event}
        (${new Date(firstBranch[0].timestamp * 1000).toLocaleString()})`);

        console.log(`${firstBranch[1].branch}  
        from: ${firstBranch[1].fromHash}
        to: ${firstBranch[1].toHash}
        event: ${firstBranch[1].event}
        (${new Date(firstBranch[1].timestamp * 1000).toLocaleString()})`);


        // /** 선택된 브랜치 **/
        // const selectedBranch = branch;
        // console.log(chalk.bgCyanBright(chalk.black("selectedBranch: ", selectedBranch)));
        //
        // /** 브랜치 존재 여부 **/
        // const branchCheck = await branchExists(branch);
        // console.log(chalk.bgCyanBright(chalk.black(branchCheck)));
        // if (branchCheck) {
        //     console.log(chalk.bgCyanBright(chalk.black("branchExists")));
        // }else {
        //     console.log(chalk.bgCyanBright(chalk.black("branch is not exists")));
        //     process.exit(1);
        // }
        //
        // const zip = mkZip(selectedBranch);
        // if(zip === false){
        //     console.log(chalk.bgCyanBright(chalk.black("zip error")));
        //     process.exit(1);
        // }else {
        //     console.log(chalk.bgCyanBright(chalk.black("zip success")));
        // }
        // /** git repo 여부 **/
        // const checkIsRepo = await existsGitDirectory();
        // if(checkIsRepo === 'false') {
        //     console.log(chalk.bgCyanBright(chalk.black("checkIsRepo: ", checkIsRepo)));
        //     process.exit(1);
        // }
        // console.log(chalk.bgCyanBright(chalk.black("checkIsRepo: ", checkIsRepo)));
        //
        // /** 이메일 가져오기 **/
        // const email = await getGitEmail();
        // if (email === null) {
        //     console.log(chalk.bgCyanBright(chalk.black("email not found")));
        //     process.exit(1);
        // }
        // console.log(chalk.bgCyanBright(chalk.black("email :",  email)));
        //
        // /** git 설정 이메일, DiFF 회원 이메일 체크 **/
        // const memberId = await verifyGitUser(email);
        // if (memberId === null) {
        //     console.log(chalk.chalk.bgCyanBright(chalk.black("memberId not found")));
        //     process.exit(1);
        // }
        // console.log(chalk.bgCyanBright(chalk.black("memberId :",  memberId)));
        //
        // /** DiFF 디렉토리 존재 여부 **/
        // const isDiFF = await existsDiFF();
        //
        // let firstChecksum;
        // if(isDiFF === 'true'){
        //     console.log(chalk.bgCyanBright(chalk.black("DiFF is exists")));
        //     // 파일에서 마지막 요청커밋 가져오기
        // } else {
        //     console.log(chalk.bgCyanBright(chalk.black('DiFF is not exists')));
        //     firstChecksum = await DiFFinit(memberId, branch);
        //     if(firstChecksum === null) {
        //         console.log(chalk.red("뭔가 문제 있음"))
        //         process.exit(1);
        //     }
        // }
        //
        // await mkDraft(memberId, branch, firstChecksum);
        // console.log(chalk.bgCyanBright(chalk.black("draft successfully")));


        // console.log('Making to draft...');
        // console.log('*', chalk.green(branch));
        // console.log('Options:', options);
        // console.log('done.');
    });

program.parse();
