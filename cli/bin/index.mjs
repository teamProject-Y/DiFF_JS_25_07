#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';

import {verifyGitUser} from '../lib/api/api.mjs';
import {
    existsGitDirectory, existsDiFF, DiFFinit,
    branchExists, doAnalysis, runMainTask
} from '../lib/git/execSync.mjs';
import {appendLogs, getRepositoryId, mkDraft} from "../lib/DiFF/draft.mjs";
import {runAnimation} from "../lib/util/interaction.mjs";
import path from "path";

const program = new Command();

program
    .name("git-mkdraft")
    .description("Git 커밋 기반 블로그 초안 생성 CLI")
    .argument('<branch>', '분석할 브랜치 이름')
    .option('--no-analysis', '분석 제외')
    .option('--no-filename', '파일명 제외')
    // .option('--full-code', '변경 전 코드 포함') // 보류
    // .option('--last-only', '첫커밋과 마지막 커밋만 추적')
    .action(async (branch, options) => {

        // const isRunning = { value: true };
        // const animationPromise = runAnimation(isRunning);
        //
        // await runMainTask();
        //
        // isRunning.value = false;
        // await animationPromise;

        // /** 선택된 브랜치 **/
        // const selectedBranch = branch;
        // console.log(chalk.bgCyanBright(chalk.black("selectedBranch: ", selectedBranch)));
        //
        // /** 브랜치 존재 여부 **/
        // const branchCheck = await branchExists(selectedBranch);
        // console.log(chalk.bgCyanBright(chalk.black(branchCheck)));
        // if (branchCheck) {
        //     console.log(chalk.bgCyanBright(chalk.black("branchExists")));
        // }else {
        //     console.log(chalk.bgRedBright(chalk.black("branch is not exists")));
        //     process.exit(1);
        // }
        //
        // /** git repo 여부 **/
        // const checkIsRepo = await existsGitDirectory();
        // if(checkIsRepo === 'false') {
        //     console.log(chalk.bgRedBright(chalk.black("checkIsRepo: ", checkIsRepo)));
        //     process.exit(1);
        // }
        // console.log(chalk.bgCyanBright(chalk.black("checkIsRepo: ", checkIsRepo)));
        //
        // /** git 설정 이메일, DiFF 회원 이메일 체크 **/
        // const memberId = await verifyGitUser();
        // if (memberId === null) {
        //     console.log(chalk.bgRedBright(chalk.black("memberId not found")));
        //     process.exit(1);
        // }
        // console.log(chalk.bgCyanBright(chalk.black("memberId :",  memberId)));
        //
        // /** 코드 점수 **/
        // if (options.analysis) {
        //     console.log(chalk.bgCyanBright(chalk.black('분석 시작')));
        //     const analysis = doAnalysis(selectedBranch);
        //     if(analysis === false){
        //         console.log(chalk.bgRedBright(chalk.black("analysis error")));
        //         process.exit(1);
        //     }else {
        //         console.log(chalk.bgCyanBright(chalk.black("analysis success")));
        //     }
        // } else {
        //     console.log(chalk.bgCyanBright(chalk.black('분석 제외 (--no-analysis)')));
        // }
        //
        // /** DiFF 디렉토리 존재 여부 **/
        // const isDiFF = await existsDiFF();
        //
        // if(isDiFF === 'true'){
        //     console.log(chalk.bgCyanBright(chalk.black("DiFF is exists")));
        // } else {
        //     console.log(chalk.bgRedBright(chalk.black('DiFF is not exists')));
        //     await DiFFinit(memberId, selectedBranch);
        // }
        //
        // const draft = await mkDraft(memberId, selectedBranch);
        // if(draft === null){
        //     console.log(chalk.bgRedBright(chalk.black('fail to make draft.')));
        // }
        // console.log(chalk.bgCyanBright(chalk.black("make draft successfully")));
    });

program.parse();
