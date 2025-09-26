import DocsSidebar from "@/app/DiFF/docs/docsSide";
import {ChevronLeft, ChevronRight} from "lucide-react";
import DocsViewer from "@/app/DiFF/docs/docsViewer";

export const metadata = { title: 'DiFF Docs — 6. 계정/보안' };

export default function StartPage() {

    const docContent = `
# 4. 계정 및 보안

**핵심만 짚는다.** 로그인은 **이메일/비밀번호**, **Google**, **GitHub** 세 가지를 지원한다.  
웹에서 **커밋 선택 → 초안 생성(UI)** 을 쓰려면 **GitHub 로그인**을 **강력 추천**한다. 권한 연결이 깔끔하고, 리포지토리 연동 이슈가 적다.

<br>

## 4-1. 가입 & 로그인

- **지원 방식**: **이메일/비밀번호**, **Google**, **GitHub**
- **이메일 검증**: **필수**. 가입 후 전송되는 확인 메일에서 **Verify** 를 눌러야 로그인 가능.
- **비밀번호 정책**: **8자 이상**, **문자/숫자/기호** **세 가지**를 모두 포함해야 한다.  
  예) \`K1nd-of!Strong\`

> **Tip**: 웹 초안 기능을 자주 쓴다면 **GitHub로 로그인**하자. 리포 권한 연동이 한 번에 끝난다.

<br>

## 5-2. 비밀번호 재설정

- 로그인 화면에서 **“비밀번호를 잊으셨나요?”** 를 선택하면, 등록된 이메일로 **재설정 링크**를 보낸다.  
- 링크를 통해 **새 비밀번호**를 설정하면 즉시 적용된다.

> **중요**: 재설정 링크는 **유효 시간**이 있다. 메일을 받으면 **바로 진행**하자.

<br>

## 5-3. GitHub 연동 & 권한

- 웹 초안 기능은 **GitHub OAuth** 를 사용한다.
- **권장 범위**: **본인이 \`commit/push\` 권한을 가진 리포지토리**.  
  기술적으로 공개 리포의 커밋 열람은 가능하지만, **우리 서비스에서는 비권한 리포 활용을 권장하지 않는다**.
- 초안을 만들 대상 리포지토리는 **Read(커밋/히스토리 조회)** 가 필수이며, 팀 협업 중이면 **Push 권한 보유자**가 연결하는 편이 안전하다.

> **중요**: **내가 기여 권한을 가진 리포**로 연결하라. 권한 충돌이 없고, 기록 관리가 깔끔하다.

<br>

## 5-4. 팀 리포지토리

- **팀/조직 리포지토리**도 연결 가능하다.  
- 팀 리포를 연결할 때는 **조직 정책(Protected Branch, Required Checks 등)** 을 먼저 확인하자.  
- 게시 전 초안은 **\`Drafts\`** 에 쌓인다. **게시 권한/검토 프로세스**는 팀 컨벤션에 맞춰 운영하면 된다.

<br>

## 5-5. 현재 제공하지 않는 것

- **2단계 인증(MFA)**: **아직 제공하지 않는다**.  
- **세션/디바이스 관리**: 전용 화면은 **아직 없다**.  
  (필요 시 브라우저에서 로그아웃하고, GitHub 연결은 GitHub 설정에서 별도 관리 가능)

> 기능은 점진적으로 추가된다. 우선순위는 **웹 초안 안정화**와 **GitHub 연동 경험 개선**이다.

<br>

## 5-6. 실무 팁

- **권한 최소화**: 초안을 만들 리포만 연결하라. 테스트용/개인 실험 리포로 먼저 검증하면 안전하다.
- **비밀번호 위생**: 규칙을 지켜도 **재사용 금지**는 기본. 새 서비스엔 **새 비밀번호**를.
- **GitHub 조직**: 필요 권한(특히 Private Repo 접근)을 **조직 Owner**에게 확인해두자.

> **요약**  
> **GitHub 로그인 + 본인 Push 권한 리포** 조합이 최선. **이메일 검증은 필수**, **비밀번호는 8자 이상·문자/숫자/기호 포함**.  
> 아직 MFA/세션 관리는 없다. 필요한 핵심은 다 갖췄고, 나머지는 차근히 채워간다.

<br>

`;

    return (
        <div className="min-h-screen dark:text-neutral-300">
            <div className="px-8 flex">
                <div className="w-1/5">
                    <DocsSidebar activeKey="/DiFF/docs/account" />
                </div>

                <main className="flex-1 flex flex-col py-20 items-center
                                 max-w-[640px] sm:max-w-[700px] md:max-w-[760px] lg:max-w-[820px] xl:max-w-[880px] px-4 sm:px-6 lg:px-10">
                    <div className="toast-viewer">
                        <DocsViewer content={docContent} />
                    </div>
                    <div className="docsNavi">
                        <a href="../docs/analysis" className="mx-10"><ChevronLeft className="w-5 h-5 inline-block"/> 이전글: 3. 분석</a>
                        <a href="../docs/support" className="mx-10">다음글: 5. 지원 <ChevronRight className="w-5 h-5 inline-block"/></a>
                    </div>
                </main>
            </div>
        </div>
    );
}