import DocsSidebar from "@/common/docsSide";

export const metadata = { title: 'DiFF Docs — 2. 시작' };

export default function StartPage() {
    return (
        <div className="min-h-screen dark:text-neutral-300">
            <div className="max-w-7xl px-8 flex">
                <div className="w-1/5">
                    <DocsSidebar />
                </div>
                <main className="prose prose-invert w-3/4 p-10">
                    <div className="title1">2. 시작하기</div>
                    <hr/>
                    <div className="content1">DiFF를 시작하기 위한 절차를 소개합니다. DiFF 사용을 위해 초기 세팅이 필요합니다.</div>

                    <div className="title2">2-1. 회원가입/로그인
                    </div>
                    <div className="content1">
                        DiFF의 메인 페이지에서 회원가입 버튼을 클릭하거나 또는 google, github 사용자라면 간단하게 소셜 회원가입을 할 수 있습니다.
                        <br/><br/>
                        DiFF는 토큰을 사용하여 로그인을 유지합니다. DiFF 사이트에 재접속을 해도 다시 로그인할 필요가 없습니다.
                        <br/><br/>
                        <a href="../member/join" className="hover:underline"><i className="fa-solid fa-arrow-right mr-2"></i>회원가입</a>
                    </div>
                    <div className="title2">2-2. Git 설치</div>
                    <div className="content1">
                        DiFF는 코드 변경사항을 Git을 통해 추출하기 때문에 DiFF를 사용하기 위해서는 Git 설치가 필수입니다.
                        <br/><br/>
                        아직 Git을 사용해본적 없다면 Git을 사용해 버전을 관리하세요. Git과 함께 DiFF는 사용자의 개발 학습에 큰 도움을 줄 것입니다.
                        <br/><br/>
                        <a href="https://git-scm.com/downloads" className="hover:underline">
                        <img src="https://git-scm.com/images/logos/downloads/Git-Logo-White.png" alt="git logo"
                             className="w-1/2 mx-auto my-3"/>
                        <i className="fa-solid fa-arrow-right mr-2"></i>Git 설치</a>
                    </div>
                    <div className="title2">2-3. .DiFF 설치</div>
                    <div className="content1">

                        <br/><br/>
                    </div>
                    <div className="title2">2-4. Git 계정 연동하기</div>
                    <div className="content1">

                        <br/><br/>
                    </div>
                    <div className="docsNavi">
                        <a href="../docs/intro"><i className="fa-solid fa-arrow-left"></i> 이전글: 1. 소개</a>
                        <a href="../docs/howto">다음글: 3. 사용법 <i className="fa-solid fa-arrow-right"></i></a>
                    </div>
                </main>
            </div>
        </div>
    );
}