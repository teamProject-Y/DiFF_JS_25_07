#!/usr/bin/env node

import {Command} from 'commander';
import chalk from 'chalk';

import {createDraft, mkDraft, getRepositoryId} from "../lib/DiFF/draft.mjs";
import {verifyGitUser} from '../lib/api/api.mjs';
import {
    existsGitDirectory, existsDiFF, DiFFinit, branchExists, doAnalysis, getLastChecksum
} from '../lib/git/execSync.mjs';
import {runAnimation} from "../lib/util/interaction.mjs";

const program = new Command();

program
    .name("git-mkdraft")
    .description("Git 커밋 기반 블로그 초안 생성 CLI")
    .argument('<branch>', '분석할 브랜치 이름')
    .option('--no-analysis', '분석 제외')
    .helpOption("-h, --help", "easy draft cli\noptions: <--no-analysis> 분석 제외")

    .action(async (branch, options) => {

        console.log("mkdraft called");/////log/////

        /** 선택된 브랜치 **/
        const selectedBranch = branch;

        /** 브랜치 존재 여부 **/
        const branchCheck = await branchExists(selectedBranch);
        if (!branchCheck) {
            console.log(chalk.red("branch is not exists"));
            process.exit(1);
        } else console.log("Selected branch:", selectedBranch);/////log/////

        /** git repo 여부 **/
        const checkIsRepo = await existsGitDirectory();
        if (checkIsRepo === 'false') {
            console.log(chalk.red("fatal: not a git repository (or any of the parent directories): .git"));
            process.exit(1);
        }else console.log("checkIsRepo: ", checkIsRepo);/////log/////

        /** git 설정 이메일 → memberId **/
        const memberId = await verifyGitUser();
        if (memberId === null) {
            console.log("memberId is null"); /////log/////
            process.exit(1);
        } console.log("memberId: ", memberId);

        /** DiFF 디렉토리 존재 여부 **/
        const isDiFF = await existsDiFF();
        if (isDiFF !== 'true') {
            console.log(".DiFF does not exist. Creating .DiFF...");
            await DiFFinit(memberId, selectedBranch);
            console.log(".DiFF created successfully.");
        }

        /** ⚡ repositoryId 가져오기 (.DiFF/config 에서) **/
        const repositoryId = await getRepositoryId();
        if (!repositoryId) {
            console.log(chalk.red("DiFF repository not found."));
            process.exit(1);
        }

        /** ⚡ draft 먼저 생성 **/
        const {draftId, diffId} = await createDraft(memberId, repositoryId);
        if (!draftId) {
            process.exit(1);
        }

        /** 코드 분석 **/
        if (options.analysis) {
            console.log("Starting analysis...");
            const isRunning = {value: true};
            const animationPromise = runAnimation(isRunning);
            console.log("Analysis in progress. This may take a while...");
            const analysis = await doAnalysis(selectedBranch, memberId, draftId, diffId);

            isRunning.value = false;
            await animationPromise;

            if (analysis === false) {
                process.exit(1);
            } else {
                console.log("Analysis completed successfully.");
            }
        }

        /** diff + draft 업데이트 **/
        const lastChecksum = await getLastChecksum(selectedBranch);

        const draft = await mkDraft(memberId, selectedBranch, draftId, diffId, lastChecksum);
        console.log("Starting draft creation...");

        if (draft === null) {
            console.log(chalk.red('Failed to make draft.'));
        } else {
            console.log("Draft created successfully.");
        }
    });

program.parse(process.argv);
