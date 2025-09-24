import DocsSidebar from "../docsSide";
import DocsViewer from "../docsViewer";
import {ChevronLeft, ChevronRight} from "lucide-react";

export const metadata = { title: "DiFF Docs — 5. 분석" };

export default function AnalysisPage() {
    const docContent = `
# 3. 분석

## 3-1. 분석 방법

**분석은 초안 생성과 동시에 수행**된다. 
사용자가 **CLI**에서 초안을 만들거나, 리포지토리의 **\`Make Draft\` 버튼**을 눌러 diff를 추출하면 **SonarQube 기반 코드 점수 분석**이 함께 된다.  
분석 결과는 **게시글에만 노출**되며, **임시저장(Drafts) 목록에는 표시되지 않는다**.

- **실행 경로**
  - **UI(Commit 기반)**: 커밋 **1개**를 대상으로 초안 + 분석을 수행한다. **분석은 항상 함께 실행**된다.
  - **CLI(범위 기반)**: **직전 초안 지점 이후 ~ 지정 지점**의 커밋 범위를 대상으로 한다. 기본값은 **분석 포함**이며, 필요하면 **\`--no-analysis\`** 옵션으로 **분석을 끌 수 있다**.
- **처리 단위/스냅샷**: 분석 결과는 **해당 커밋(또는 범위)의 스냅샷**으로 저장된다. 이후 코드를 추가로 푸시해도, **게시물에 붙은 분석 값은 생성 시점 기준**으로 남는다.
- **표시 위치**: 게시된 글의 상단 또는 사이드 패널에 **전체/최근/게시물별** 품질 지표가 정리돼 노출된다.
- **동시 실행 제한**: 초안/분석은 **한 번에 1건**만 처리한다. 실행 중에는 **CLI 터미널** 또는 **GitHub 커밋 목록**이 **비활성화**된다. (다른 작업은 계속 가능)

### 성능 특성
- **평균 소요 시간**: 초안 1건당 **보통 3분 이내**. 리포지토리가 클수록 더 걸릴 수 있다.
- **분석 제외 시**(\`--no-analysis\`): **대략 절반** 수준으로 단축되는 경향.
- **권장**: 대용량 리포지토리나 빠른 반복 작업이 필요하면 **CLI + \`--no-analysis\`**를 우선 적용하고, 필요한 글만 분석을 켜서 생성한다.

> **참고**  
> 테스트 커버리지와 일부 지표는 **빌드/테스트 리포트가 준비되어 있을 때** 정확도가 높다. 리포트가 없으면 **0% 또는 미집계**로 보일 수 있다.

<br>

## 3-2. 지표와 산정 방식

분석 점수는 **6개 핵심 지표**를 바탕으로 한다. 각 지표는 **A~E 등급**으로 환산된 뒤 **내부 점수화**하여 **평균**을 산출한다. 최종적으로 **프로젝트 품질 등급**이 **전체 / 최근 / 게시물별**로 표시된다.

- **Coverage (테스트 커버리지)**: 단위 테스트가 전체 코드에서 차지하는 비율  
- **Bugs (버그 지표)**: 잠재적 버그로 탐지된 이슈 수  
- **Vulnerabilities (보안 취약점)**: 보안 위험 코드 패턴의 개수  
- **Code Smells (코드 스멜)**: 유지보수성을 떨어뜨리는 코드 패턴  
- **Complexity (복잡도)**: 함수/메서드의 **순환 복잡도** 등 복잡성 지표  
- **Duplicated Lines Density (중복율)**: 전체 라인 대비 **중복 라인 비율**

> **해석 팁**  
> - **높은 커버리지**, **낮은 Bugs/Vulnerabilities/Smells**, **낮은 중복**, **낮은 복잡도**가 이상적이다.  
> - 특정 게시물에서 급격한 변화가 보이면, **그 시점의 변경**을 코드와 함께 검토하자.

<br>

## 3-3. 분석 언어

**지원 언어**  
Java, JavaScript, TypeScript, HTML, CSS, PHP, Python, XML, JSON, YAML, Kotlin, Swift, Ruby, Go

**비지원(또는 제한) 언어**  
**C 계열(C/C++/Objective-C/C# 등)** 은 지원하지 않는다. 또한 **마크업/데이터 중심 언어(JSON/YAML/XML)** 는 구조 특성상 일부 지표(예: 복잡도, 커버리지)가 **부분 집계**되거나 **의미가 제한적**일 수 있다.

> **주의**  
> 폴리글랏(다중 언어) 모노레포의 경우, **지원 언어에 해당하는 파일만 분석**된다. 바이너리/생성물(빌드 산출물)은 대상에서 제외된다.

<br>

`;

    return (
        <div className="min-h-screen dark:text-neutral-300">
            <div className="px-8 flex">

                <div className="w-1/5">
                    <DocsSidebar activeKey="/DiFF/docs/analysis" />
                </div>

                <main className="flex-1 flex flex-col py-20 items-center
                max-w-[640px] sm:max-w-[700px] md:max-w-[760px] lg:max-w-[820px] xl:max-w-[880px] px-4 sm:px-6 lg:px-10">

                    <div className="toast-viewer">
                        <DocsViewer content={docContent} />
                    </div>

                    <div className="docsNavi">
                        <a href="../docs/howto" className="mx-10"><ChevronLeft className="w-5 h-5 inline-block"/> 이전글: 2. 사용법</a>
                        <a href="../docs/account" className="mx-10">다음글: 4. 계정 및 보안 <ChevronRight className="w-5 h-5 inline-block"/></a>
                    </div>
                </main>
            </div>
        </div>
    );
}
