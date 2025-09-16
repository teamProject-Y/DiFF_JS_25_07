import Link from "next/link";
import {ChevronRight} from "lucide-react";
import DocsSidebar from "@/app/DiFF/docs/docsSide";
import DocsViewer from "@/app/DiFF/docs/docsViewer";
export const metadata = { title: 'DiFF Docs — 1. 소개' };

export default function IntroPage() {
    const docContent = `
# 1. 소개 (Overview)

**Draft from CLI or Commit** — **당신의 개발기록을 콘텐츠로 바꿔주는 스마트 워크플로우**.  
DiFF는 개발 학습자의 기록을 **자동으로 수집·정리**해, **Git 커밋 diff**에서 **마크다운 초안**을 만든다. 버튼 한 번(또는 명령 한 줄)으로 **변경 코드 수집**과 **간단한 제목 생성**이 끝난다. **코드 점수 분석**까지 한 번에 처리해, **성장 추이를 대시보드로 파악**할 수 있다.

<br>

## 1-1. DiFF에 대하여

- **누구를 위한 것인가**: “학생”으로 한정하지 않는다. **코드를 만지는 모든 사람**을 위한 도구다.  
- **무엇을 해결하나**: 블로그 쓰느라 **바꾼 코드를 찾고 붙여넣는 데 낭비되는 시간**을 줄인다. 글의 핵심은 코드다. **설명은 최소화**, 초안 생성을 **최대한 빠르게**.  
- **무엇이 자동화되나**
  - **커밋/범위의 diff 수집** → 파일별 **코드 스니펫(마크다운)** 정리
  - **간단한 제목 생성**(한 줄 요약)
  - **코드 점수 분석**(선택): SonarQube로 **복잡도**, **중복**, **버그 지표** 등을 계산  
- **연동과 권한**
  - **GitHub** 연동을 전제로 한다.  
  - **본인이 커밋/푸시 권한을 가진 리포지토리**를 대상으로 쓰는 것을 **권장**한다.  
  - 기술적으로 타 리포지토리의 커밋 열람은 가능하지만, **우리 서비스에서는 권장하지 않는다**.  
- **현재 상태**: **아직 배포 전**(프리뷰/내부 검증 단계). 공개 일정은 추후 공지.  
- **데이터/프라이버시**: 이 항목은 **다른 파트에서 별도로** 다룬다.

<br>

## 1-2. 어떻게 동작하나

- **UI(Commit 기반)**: GitHub에서 **커밋 1개**를 골라 초안을 만든다.  
- **CLI(범위 기반) — 추천**: 시스템이 **직전 초안 생성 지점**을 기억해, 그 이후 ~ 현재 지정 지점까지의 **커밋 범위**를 자동으로 잡아 초안을 만든다.  
  - **더 빠르다**: 보통 UI보다 **생성 시간이 유리**하다.  
  - **분석 제외 옵션**: \`--no-analysis\`로 **코드 점수 분석을 건너뛰면** 속도가 **더 빨라진다**.

> **중요**  
> - **동시 요청은 불가**: **한 번에 1건**만 처리한다.  
>   - CLI 실행 중에는 **해당 터미널**이 잠시 **비활성화**(동일 명령 재실행 불가).  
>   - UI에서는 **GitHub 커밋 목록**이 **비활성화**된다.  
> - 처리 중이라도 **사용자는 다른 작업을 계속**할 수 있다.

<br>

## 1-3. 성능과 제약

- **평균 소요 시간**: 초안 1건당 **보통 3분 이내**의 시간이 소요된다..  
- **프로젝트가 클수록** 더 오래 걸릴 수 있다.  
- **분석 제외 시(\`--no-analysis\`)**: **약 절반 수준**으로 단축되는 효과가 있다.  
- **출력 성격**: 초안은 **짧은 제목 + 코드 스니펫(마크다운)** 중심이다. **장문의 해설은 포함하지 않는다**.  
- **지원 범위**: 현재 **GitHub만 지원**한다.

<br>

## 1-4. DiFF를 사용하면

- **나의 학습 흐름**을 시점별 코드 변경과 점수 지표로 확인한다.  
- 블로그 초안이 자동으로 쌓이니, **편집과 게시에만 집중**하면 된다.  
- 커뮤니티 기능(댓글·좋아요)으로 **다른 사용자와 교류**한다.  
- **다른 사용자의 리포지토리**를 참고하며 배운다.

<br>

`;

    return (
        <div className="min-h-screen dark:text-neutral-300">
            <div className="px-8 flex">
                {/* 사이드바 */}
                <div className="w-1/5">
                    <DocsSidebar activeKey="/DiFF/docs/intro" />
                </div>

                {/* 메인 컨텐츠 */}
                <main className="flex-1 flex flex-col py-20 items-center
                    max-w-[640px] sm:max-w-[700px] md:max-w-[760px] lg:max-w-[820px] xl:max-w-[880px] px-4 sm:px-6 lg:px-10">
                    {/* Toast UI Viewer */}
                    <div className="toast-viewer">
                        <DocsViewer content={docContent} />
                    </div>

                    <div className="docsNavi">
                        <Link href="/DiFF/docs/howto" className="mx-10">
                            다음글: 2. 사용법 <ChevronRight className="w-5 h-5 inline-block"/>
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
}
