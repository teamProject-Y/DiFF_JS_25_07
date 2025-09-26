import DocsSidebar from "@/app/DiFF/docs/docsSide";
import {ChevronLeft, ChevronRight} from "lucide-react";
import DocsViewer from "@/app/DiFF/docs/docsViewer";
import Link from "next/link";

export const metadata = { title: 'DiFF Docs — 7. 지원' };

export default function StartPage() {

    const docContent = `
# 5. 고객지원 (Customer Support)

## Contact Us
- **Email**: <diff.io.kr@gmail.com> 
- **GitHub Issues**: https://github.com/teamProject-Y/DiFF/issues

> **중요**: 급한 장애는 **Email + Issues** 둘 다 남겨주세요. 재현정보(명령어, 커밋 SHA, 스크린샷/로그) 포함.

<br>

## FAQ (Top 4)
1) **시작 조건** — 웹 초안 기능을 쓰려면 GitHub 로그인이 꼭 필요한가요?  
    - 아니요. 그렇지 않습니다. DiFF 계정만 있다면 그리고 Github 계정만 있다면 나중에 Github 연동을 통해 웹 초안 기능을 사용할 수 있습니다.
2) **Drafts가 비어 있음** — 초안 생성 성공인데 목록에 안 보일 때 체크리스트는?   
    - 생성 작업이 **아직 진행 중**일 수 있습니다. 잠시 후 **새로고침**하여 확인해보세요.
    - UI에선 생성 중 **커밋 목록이 비활성화**됩니다. 요청이 종료되면 다시 자동으로 활성화 되니 기다려주세요. 
    - CLI는 **터미널 작업 종료**까지 기다려야 합니다. 실패 로그가 있으면 공유를 부탁드립니다. 
3) CLI 오류 — \`npx git-mkdraft\` 실행 실패/권한 문제 발생 시 점검 순서?
    - \`node --version\` / \`npm -v\` 확인 후 \`npx git-mkdraft\` 재실행해보세요.
    - 느리면 \`--no-analysis\` 로 먼저 검증하고, 정상 확인 후 분석을 활성화 시켜보세요.
4) **분석 성능** — 분석이 오래 걸리거나 커버리지가 0%로 뜨는 이유와 대처는?  
    - 분석은 **리포 규모에 비례해 시간**이 든다. 급하면 \`--no - analysis\`를 사용해보세요.  
    - Coverage 0%는 **테스트 리포트가 없을 때** 흔하다. CI에서 커버리지 리포트를 생성해 반영해보세요.

<br>

## 버그 제보 / 기능 요청 가이드
- **버그**: 현상 요약, 재현 단계, 기대 결과/실제 결과, 환경(브라우저/OS/CLI 버전), 관련 커밋 SHA.  
- **기능 요청**: 문제 배경, 제안 기능, 예상 워크플로우, 우선순위(High/Medium/Low).

## 지원 시간 & 우선순위 (샘플)
- **지원 시간**: 평일 10:00–18:00 KST  
- **우선순위 정의**:  
  - P1: 생성/로그인 불가 등 전체 차단 이슈  
  - P2: 주요 기능 저하(우회 가능)  
  - P3: 경미한 버그/개선 제안

<br>
`;


    return (
        <div className="min-h-screen dark:text-neutral-300">
            <div className="px-8 flex">
                <div className="w-1/5">
                    <DocsSidebar activeKey="/DiFF/docs/support" />
                </div>

                <main className="flex-1 flex flex-col py-20 items-center
                                 max-w-[640px] sm:max-w-[700px] md:max-w-[760px] lg:max-w-[820px] xl:max-w-[880px] px-4 sm:px-6 lg:px-10">
                    <div className="toast-viewer">
                        <DocsViewer content={docContent} />
                    </div>
                    <div className="docsNavi">
                        <Link href="/DiFF/docs/account" className="mx-10">
                            <ChevronLeft className="w-5 h-5 inline-block"/> 이전글: 4. 계정 및 보안
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
}