#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { createDraft, mkDraft,getRepositoryId } from "../lib/DiFF/draft.mjs";
import { verifyGitUser } from '../lib/api/api.mjs';
import {
    existsGitDirectory, existsDiFF, DiFFinit, branchExists, doAnalysis
} from '../lib/git/execSync.mjs';
import { runAnimation } from "../lib/util/interaction.mjs";

const program = new Command();

program
    .name("git-mkdraft")
    .description("Git 커밋 기반 블로그 초안 생성 CLI")
    .argument('<branch>', '분석할 브랜치 이름')
    .option('--no-analysis', '분석 제외')
    .option('--no-filename', '파일명 제외')
    .action(async (branch, options) => {
        /** 선택된 브랜치 **/
        const selectedBranch = branch;
        console.log(chalk.bgCyanBright(chalk.black("selectedBranch: ", selectedBranch)));

        /** 브랜치 존재 여부 **/
        const branchCheck = await branchExists(selectedBranch);
        if (!branchCheck) {
            console.log(chalk.bgRedBright(chalk.black("branch is not exists")));
            process.exit(1);
        }
        console.log(chalk.bgCyanBright(chalk.black("branchExists")));

        /** git repo 여부 **/
        const checkIsRepo = await existsGitDirectory();
        if (checkIsRepo === 'false') {
            console.log(chalk.bgRedBright(chalk.black("checkIsRepo: ", checkIsRepo)));
            process.exit(1);
        }
        console.log(chalk.bgCyanBright(chalk.black("checkIsRepo: ", checkIsRepo)));

        /** git 설정 이메일 → memberId **/
        const memberId = await verifyGitUser();
        if (memberId === null) {
            console.log(chalk.bgRedBright(chalk.black("memberId not found")));
            process.exit(1);
        }
        console.log(chalk.bgCyanBright(chalk.black("memberId :", memberId)));

        /** DiFF 디렉토리 존재 여부 **/
        const isDiFF = await existsDiFF();
        if (isDiFF === 'true') {
            console.log(chalk.bgCyanBright(chalk.black("DiFF is exists")));
        } else {
            console.log(chalk.bgRedBright(chalk.black("DiFF is not exists")));
            await DiFFinit(memberId, selectedBranch);
        }

        /** ⚡ repositoryId 가져오기 (.DiFF/config 에서) **/
        const repositoryId = await getRepositoryId();
        if (!repositoryId) {
            console.log(chalk.bgRedBright(chalk.black("repositoryId not found")));
            process.exit(1);
        }

        /** ⚡ draft 먼저 생성 **/
        const { draftId, diffId } = await createDraft(memberId, repositoryId);
        if (!draftId) {
            console.log(chalk.bgRedBright("draft 생성 실패"));
            process.exit(1);
        }
        console.log(chalk.bgGreen(`✅ draftId=${draftId}, diffId=${diffId} 생성 완료`));

        /** 코드 분석 **/
        if (options.analysis) {
            console.log(chalk.bgCyanBright(chalk.black('분석 시작')));
            const isRunning = { value: true };
            const animationPromise = runAnimation(isRunning);

            const analysis = await doAnalysis(selectedBranch, memberId, draftId, diffId); // ✅ diffId 전달

            isRunning.value = false;
            await animationPromise;

            if (analysis === false) {
                console.log(chalk.bgRedBright(chalk.black("analysis error")));
                process.exit(1);
            } else {
                console.log(chalk.bgCyanBright(chalk.black("analysis success")));
            }
        } else {
            console.log(chalk.bgCyanBright(chalk.black('분석 제외 (--no-analysis)')));
        }

        /** diff + draft 업데이트 **/
        const draft = await mkDraft(memberId, selectedBranch, draftId, diffId);
        console.log(chalk.bgCyanBright(chalk.black("draft 생성 시작")));

        if (draft === null) {
            console.log(chalk.bgRedBright(chalk.black('fail to make draft.')));
        } else {
            console.log(chalk.bgCyanBright(chalk.black("make draft successfully")));
        }
    });

program.parse();
