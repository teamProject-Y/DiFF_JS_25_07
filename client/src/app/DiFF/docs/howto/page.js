import DocsSidebar from "@/app/DiFF/docs/docsSide";
import {ChevronLeft, ChevronRight} from "lucide-react";
import DocsViewer from "@/app/DiFF/docs/docsViewer";

export const metadata = { title: 'DiFF Docs — 3. 사용법' };

export default function howToPage() {

    const docContent = `
# 3. Draft from Git Commits

개발 블로그에 **Git 커밋의 diff**를 모아 **마크다운 초안**을 자동으로 만든다. 목적은 단순하다. **변경 코드를 찾아 붙여넣는 수고를 줄이는 것**. 장황한 해설은 넣지 않는다.

<br>

## TL;DR

- 기본(default) 브랜치 커밋을 먼저 로드하고, **검색으로 모든 브랜치의 커밋**을 불러올 수 있다.  
- **UI는 단일 커밋**, **CLI는 커밋 범위**(이전 초안 요청 커밋 이후 ~ 지정 지점)를 다룬다.  
- 같은 대상을 고르면 **UI/CLI 결과는 동일**하다.  
- 초안은 **짧은 제목 + 변경 코드(마크다운)** 로 끝.  
- 초안은 **좌하단 Dial → 두 번째 메뉴 \`Drafts\`** 에 쌓인다(보기/수정/삭제/게시).  
- 초안 생성 중에는 **동시 요청 불가**다. **한 번에 1건**만 처리한다.  
  - **CLI** 실행 중엔 **해당 터미널**이 잠시 비활성화(동일 명령 재실행 불가).  
  - **UI**에선 **GitHub 커밋 목록**이 비활성화.  
  - 그동안 사용자는 **다른 작업**을 진행해도 된다.  
- 초안 만들 때 기본으로 **코드 점수 분석**이 수행된다. **CLI는 \`--no-analysis\`** 로 끌 수 있다.  
- 현재 **GitHub만 지원**한다.

<br>

## 무엇이 만들어지나

초안은 파일별 변경을 **코드블록**으로 묶어둔 깔끔한 마크다운이다. 제목은 한 줄짜리 요약만 붙인다. 이건 “자동 정리된 재료”에 가깝다. **읽고, 다듬고, 게시**하라.

샘플(형태 예시):
~~~markdown
# chore: extract PostList into separate module

## src/components/PostList.jsx
~~~diff
+ export function PostList({ posts }) {
+   return (
+     <ul>
+       {posts.map(p => <li key={p.id}>{p.title}</li>)}
+     </ul>
+   );
+ }
~~~

## src/pages/index.jsx
~~~diff
- // inline list rendering removed
+ import { PostList } from "../components/PostList";
~~~

<br>

## 선행 조건

- 블로그 로그인  
- **GitHub 연결(권한 승인)**  
- 대상 리포지토리에 대한 읽기 권한  
- (CLI 사용할 거면) Node.js/npm

<br>

## UI로 만들기 (GitHub 연결)

1. GitHub 연결을 마치고 리포지토리를 고른다.  
2. 기본 브랜치 커밋이 뜬다. **검색**으로 **다른 브랜치 커밋**도 불러온다.  
3. **커밋 1개**를 선택하고 **Generate Draft**를 누른다.  
4. 생성이 시작되면 **커밋 목록이 비활성화**된다. **동시에 다른 요청은 불가**다.  
5. 완료되면 **좌하단 Dial → 두 번째 메뉴 \`Drafts\`** 에 초안이 쌓인다. **보기/수정/삭제/게시**는 여기서 한다.

> **메모:** UI는 **항상 단일 커밋**만 대상으로 한다. 범위(diff range)가 필요하면 **CLI**를 써라.

<br>

## CLI로 만들기 (\`git-mkdraft\`) — **추천**

CLI는 대체로 **UI보다 빠르다**. 게다가 시스템이 **직전 초안 요청 커밋**을 기억한다. 즉, 따로 계산하지 않아도 **“이전 지점 이후 ~ 지금 지정 지점”**의 변경을 한 번에 긁어온다. 필요하면 **\`--no-analysis\`** 로 코드 점수 분석을 꺼서 더 **빠르게** 돌릴 수 있다.

### 설치

~~~bash
# 로컬 설치(권장)
npm install git-mkdraft

# 필요 시 글로벌
npm install -g git-mkdraft
~~~

### 실행

~~~bash
# 로컬 설치 후 npx로 실행
npx git-mkdraft

# 코드 점수 분석 제외
npx git-mkdraft --no-analysis
~~~

- 기본 동작: **이전 초안 요청 커밋 이후 ~ 현재 지정 지점** 범위를 자동으로 잡는다.  
- 생성 중엔 **해당 터미널 세션이 비활성화**된다. **동시에 다른 생성은 불가**다.  
- 같은 대상이면 **UI/CLI 결과는 동일**하다.

> (고급) 커밋 범위 직접 지정은 **작성 예정**. 별도 문서로 채운다.


## Drafts에서 마무리

모든 초안은 **\`Drafts\`** 에 모인다. **열어보고(Edit), 필요 없으면 지우고(Delete), 게시(Publish)** 하면 된다. 자동 발행은 하지 않는다. **초안은 초안일 뿐**이다.

<br>

## 내부 동작(프로세스)

1. **커밋 조회** — 기본 브랜치 로드 → **검색으로 모든 브랜치 커밋** 노출  
2. **대상 선택** — UI는 **커밋 1개**, CLI는 **범위**  
3. **Diff 추출** — 파일별 변경을 수집  
4. **마크다운 변환** — 파일 단위 코드블록으로 구성 + **간단한 제목 생성**  
5. **코드 점수 분석** — 기본 수행(**CLI는 \`--no-analysis\` 가능**)  
6. **저장** — 결과를 **\`Drafts\`** 에 저장(이후 사용자가 손보고 게시)

<br><br>

## 제약과 메모

- **동시 실행 불가**: **한 번에 1건**만 처리한다(UI/CLI 동일).  
- **UI는 단일 커밋**만 지원, **범위는 CLI**에서.  
- 현재 **GitHub만 지원**.  
- 같은 커밋(또는 같은 범위) 기준이면 **UI/CLI 결과는 동일**하다.
<br>
`;

    return (
        <div className="min-h-screen dark:text-neutral-300">
            <div className="px-8 flex">
                {/* 사이드바 */}
                <div className="w-1/5">
                    <DocsSidebar activeKey="/DiFF/docs/howto" />
                </div>

                {/* 메인 컨텐츠 */}
                <main className="flex-1 flex flex-col py-20 items-center
                    max-w-[640px] sm:max-w-[700px] md:max-w-[760px] lg:max-w-[820px] xl:max-w-[880px] px-4 sm:px-6 lg:px-10">
                    {/* Toast UI Viewer */}
                    <div className="toast-viewer">
                        <DocsViewer content={docContent} />
                    </div>
                    <div className="docsNavi">
                        <a href="../docs/start"><ChevronLeft className="w-5 h-5 inline-block"/> 이전글: 2. 시작하기</a>
                        <a href="../docs/display">다음글: 5. 화면별 안내 <ChevronRight className="w-5 h-5 inline-block"/></a>
                    </div>
                </main>
            </div>
        </div>
    );
}