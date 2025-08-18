// ./src/app/DiFF/docs/page.js
// 단일 파일 위키독스 스타일 문서 페이지 (사이드바 + 본문)
// - 클라이언트 훅/상태 없음
// - 애니메이션/타자 효과/RESULTS/LINES/getLoginDate 전부 제거
// - TailwindCSS 사용 가정

export const metadata = {
    title: 'DiFF Docs',
    description: 'DiFF 문서',
};

export default function Page() {
    return (
        <div className="min-h-screen bg-[#0f1115] text-neutral-100 pt-20">

            <div className="sticky top-0 z-20 border-b border-white/10 bg-[#0f1115]/80 backdrop-blur">
                <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                    <nav className="hidden sm:flex gap-5 text-sm text-neutral-300">
                        <a href="/member/login" className="hover:text-white">시작하기</a>
                        <a href="/faq" className="hover:text-white">FAQ</a>
                    </nav>
                </div>
            </div>

            {/* 본문 레이아웃 */}
            <div className="mx-auto max-w-7xl px-4 py-8 grid gap-8 lg:grid-cols-[260px_1fr]">
                {/* 사이드바 */}
                <aside className="hidden lg:block sticky top-[4.5rem] self-start h-[calc(100vh-5rem)] overflow-auto pr-3 border-r border-white/10">
                    <nav className="py-4 text-sm">
                        <div className="px-2 pb-2 font-bold text-lg text-neutral-300">소개</div>
                        <ul className="space-y-1 mb-10">
                            <li><a href="/intro" className="block rounded px-6 py-1.5 hover:bg-white/10">소개</a></li>
                            <li><a href="#features" className="block rounded px-6 py-1.5 hover:bg-white/10">주요 특징</a></li>
                            <li><a href="#audience" className="block rounded px-6 py-1.5 hover:bg-white/10">이용 대상</a></li>
                        </ul>

                        <div className="px-2 pb-2 font-bold text-lg text-neutral-300">시작하기</div>
                        <ul className="space-y-1 mb-10">
                            <li><a href="#start" className="block rounded px-6 py-1.5 hover:bg-white/10">개요</a></li>
                            <li><a href="#signup-login" className="block rounded px-6 py-1.5 hover:bg-white/10">회원가입·로그인</a></li>
                            <li><a href="#git-install" className="block rounded px-6 py-1.5 hover:bg-white/10">Git 설치</a></li>
                            <li><a href="#cli-install" className="block rounded px-6 py-1.5 hover:bg-white/10">CLI 설치</a></li>
                            <li><a href="#connect-git" className="block rounded px-6 py-1.5 hover:bg-white/10">Git 계정 연동</a></li>
                            <li><a href="#connect-blog" className="block rounded px-6 py-1.5 hover:bg-white/10">블로그 연동</a></li>
                        </ul>

                        <div className="px-2 pb-2 font-bold text-lg text-neutral-300">기능/화면/기타</div>
                        <ul className="space-y-1">
                            <li><a href="#glossary" className="block rounded px-6 py-1.5 hover:bg-white/10">기본 용어</a></li>
                            <li><a href="#guides" className="block rounded px-6 py-1.5 hover:bg-white/10">주요 기능 사용법</a></li>
                            <li><a href="#screens" className="block rounded px-6 py-1.5 hover:bg-white/10">화면별 안내</a></li>
                            <li><a href="#activity" className="block rounded px-6 py-1.5 hover:bg-white/10">알림/기록</a></li>
                            <li><a href="#security" className="block rounded px-6 py-1.5 hover:bg-white/10">계정·보안</a></li>
                            <li><a href="#faq" className="block rounded px-6 py-1.5 hover:bg-white/10">FAQ</a></li>
                            <li><a href="#support" className="block rounded px-6 py-1.5 hover:bg-white/10">고객 지원</a></li>
                        </ul>
                    </nav>
                </aside>

                {/* 본문 */}
                <main className="prose prose-invert max-w-none prose-headings:scroll-mt-24">
                    {/* 1. 소개 */}
                    <section id="intro" className="p-4 mb-20">
                        <h1>소개</h1>
                        <p>
                            <strong>DiFF</strong>는 개발 학습자에 의해, 개발 학습자를 위해 만들어졌습니다.
                            학습과 기록을 병행하는 데 드는 시간을 줄이고, 변경사항을 기반으로 자동 요약과 코드 스니펫을 만들어
                            블로그 초안을 제공합니다. 또한 각 변경 시점마다 코드 품질을 분석하고 대시보드로 시각화합니다.
                        </p>
                    </section>

                    <section id="features" className="p-4 mb-20">
                        <h2>주요 특징</h2>
                        <h3>자동 기록</h3>
                        <p>체크섬을 따로 찾을 필요 없이 브랜치별로 마지막 블로그 작성 시점을 기억합니다.</p>
                        <h3>블로그 초안 생성</h3>
                        <p>변경된 코드와 요약을 기반으로 글의 뼈대를 자동 생성합니다. 사용자는 생각만 추가하면 됩니다.</p>
                        <h3>코드 품질 분석</h3>
                        <p>요청 시점마다 유지보수성/안정성을 평가하고, 시간 흐름에 따른 변화를 대시보드로 제공합니다.</p>
                    </section>

                    <section id="audience" className="p-4 mb-20">
                        <h2>이용 대상</h2>
                        <p>학생뿐 아니라 코드를 다루는 누구나 사용할 수 있습니다. Git과 DiFF는 생각보다 간단하고 유용합니다.</p>
                    </section>

                    {/* 2. 시작하기 */}
                    <section id="start" className="p-4 mb-20">
                        <h2>시작하기</h2>
                        <ol>
                            <li id="signup-login"><strong>회원가입·로그인</strong> — 메인에서 회원가입 또는 Google/GitHub 소셜 로그인<br/>
                                예: <code>/DiFF/member/join</code> (개발 환경 URL, 배포 시 교체)
                            </li>
                            <li id="git-install"><strong>Git 설치</strong> — 설치 확인:
                                <pre><code className="language-bash">git --version</code></pre>
                            </li>
                            <li id="cli-install"><strong>CLI 설치</strong> — 실제 패키지명 확정 후:
                                <pre><code className="language-bash">npm i -g @your-scope/diff-cli</code></pre>
                            </li>
                            <li id="connect-git"><strong>Git 계정 연동</strong> — 최초 실행 시 이메일 검증 → 조직/리포 선택 → 로컬 <code>.DiFF/</code> 생성(<code>config</code>, <code>meta</code>, <code>branchesLog</code>)</li>
                            <li id="connect-blog"><strong>블로그 플랫폼 연동</strong> — 티스토리/Velog/Medium/Notion 등 API 토큰/웹훅으로 원클릭 발행(베타)</li>
                        </ol>
                    </section>

                    {/* 3. 기본 용어 */}
                    <section id="glossary" className="p-4 mb-20">
                        <h2>기본 용어 이해</h2>
                        <table>
                            <thead><tr><th>용어</th><th>설명</th></tr></thead>
                            <tbody>
                            <tr><td>커밋(commit)</td><td>코드 변경 단위. 고유 해시(체크섬)를 가집니다.</td></tr>
                            <tr><td>체크섬</td><td>커밋을 식별하는 SHA 해시 값.</td></tr>
                            <tr><td>diff(변경사항)</td><td>두 커밋/상태 사이의 코드 변경.</td></tr>
                            <tr><td>코드 스니펫</td><td>글에 포함할 핵심 코드 부분.</td></tr>
                            <tr><td>코드 품질 지표</td><td>유지보수성/안정성 등을 수치화한 값.</td></tr>
                            </tbody>
                        </table>
                    </section>

                    {/* 4. 주요 기능 */}
                    <section id="guides" className="p-4 mb-20">
                        <h2>주요 기능 사용법</h2>

                        <h3>Git 변경사항 추적</h3>
                        <pre><code className="language-bash">diff track</code></pre>
                        <p>현재 브랜치의 마지막 글 작성 시점 이후 변경을 자동 식별합니다.</p>

                        <h3>이전 요청과 비교(diff)</h3>
                        <pre><code className="language-bash">diff compare --since last-post</code></pre>

                        <h3>블로그 초안 생성</h3>
                        <pre><code className="language-bash">diff draft --open</code></pre>
                        <p>변경 요약 + 코드 스니펫 기반의 초안(Markdown/MDX)을 생성합니다.</p>

                        <h3>블로그 템플릿 수정/보완</h3>
                        <p><code>.DiFF/config</code>에서 템플릿 변수(제목/요약/변경 수치 등)를 조합해 원하는 형식으로 출력합니다.</p>

                        <h3>.DiFF 폴더/설정</h3>
                        <ul>
                            <li><code>.DiFF/config</code> — 설정 정보</li>
                            <li><code>.DiFF/meta</code> — 리포지토리/브랜치/커밋 범위 메타데이터</li>
                            <li><code>.DiFF/branchesLog</code> — 브랜치별 기록</li>
                        </ul>
                    </section>

                    {/* 5. 화면별 안내 */}
                    <section id="screens" className="p-4 mb-20">
                        <h2>화면별 안내</h2>
                        <ul>
                            <li><strong>대시보드</strong> — 품질 점수 그래프, 최근 글/분석 이력, 리포지토리 요약 카드</li>
                            <li><strong>블로그 작성</strong> — 생성된 초안 확인, 템플릿 선택, 플랫폼 발행</li>
                            <li><strong>품질 분석</strong> — 마지막 분석 시간, 점수 분해, 개선 항목</li>
                            <li><strong>설정</strong> — 계정/권한, 토큰, 알림 채널</li>
                        </ul>
                    </section>

                    {/* 6. 알림 및 기록 */}
                    <section id="activity" className="p-4 mb-20">
                        <h2>알림 및 기록</h2>
                        <ul>
                            <li><strong>분석 완료 알림</strong> — 이메일/웹 푸시/슬랙 등</li>
                            <li><strong>블로그 작성 이력</strong> — 생성/발행 기록 시간순 확인</li>
                            <li><strong>코드 품질 변화 추적</strong> — 타임라인으로 변화 뷰</li>
                        </ul>
                    </section>

                    {/* 7. 계정 및 보안 */}
                    <section id="security" className="p-4 mb-20">
                        <h2>계정 및 보안</h2>
                        <ul>
                            <li><strong>비밀번호 변경</strong>, 2단계 인증(옵션), 세션 종료</li>
                            <li><strong>Git 권한 관리</strong> — 최소 권한 원칙, 조직/리포 단위 설정/해지</li>
                            <li><strong>데이터 삭제 및 탈퇴</strong> — 정책에 따른 일괄 삭제 지원</li>
                        </ul>
                    </section>

                    {/* 8. FAQ */}
                    <section id="faq" className="p-4 mb-20">
                        <h2>문제 해결 (FAQ)</h2>
                        <h3>커밋이 인식되지 않는 경우</h3>
                        <ul>
                            <li><code>git status</code>로 로컬 저장소 상태 확인</li>
                            <li><code>.DiFF/</code> 폴더 권한/경로 확인</li>
                        </ul>
                        <h3>블로그 소스가 생성되지 않는 경우</h3>
                        <ul>
                            <li>템플릿 설정 확인 (<code>.DiFF/config</code>)</li>
                            <li>CLI 로그에서 에러 메시지 확인</li>
                        </ul>
                        <h3>품질 점수가 표시되지 않는 경우</h3>
                        <ul>
                            <li><code>diff analyze</code> 실행 후 대시보드 새로고침</li>
                        </ul>
                        <h3>연동 오류 해결</h3>
                        <ul>
                            <li>토큰 만료/권한 범위 재설정</li>
                            <li>네트워크/프록시 설정 확인</li>
                        </ul>
                    </section>

                    {/* 9. 고객 지원 */}
                    <section id="support" className="p-4 mb-20">
                        <h2>고객 지원</h2>
                        <p>
                            문의/피드백: <a href="mail:support@yourdomain.dev">diff@diff</a><br/>
                            노션 보드 / 업데이트 소식: (링크)
                        </p>
                    </section>
                </main>
            </div>
        </div>
    );
}
