import DocsSidebar from "@/common/docsSide";

export const metadata = { title: 'DiFF Docs — 3. 사용법' };

export default function StartPage() {
    return (
        <div className="min-h-screen">
            <div className="max-w-7xl p-8 flex">
                <div className="w-1/5">
                    <DocsSidebar />
                </div>
                <main className="prose prose-invert w-3/4 p-10">
                    <div className="title1">3. 사용법</div>
                    <hr/>
                    <div className="content1">DiFF를 사용하기 위한 방법을 소개합니다. DiFF 사용을 위해 초기 세팅이 필요합니다.</div>

                    <div className="title2">2-1. 회원가입/로그인
                    </div>
                    <div className="content1">
                        <ol>
                            <li className="list_item">자동기록</li>
                            <li className="list_content">특정 시점을 찾아보고 체크섬을 제공할 필요 없이, DiFF는 스스로 마지막 블로그 작성 시점을 기억합니다.<br/>
                                각 브랜치 별로 기억하기 때문에 여러 브랜치에서 각각 블로그 작성도 가능합니다.</li>
                            <li className="list_item">블로그 초안 생성</li>
                            <li className="list_content">특정 시점을 찾아보고 체크섬을 제공할 필요 없이, DiFF는 스스로 마지막 블로그 작성 시점을 기억합니다.<br/>
                                각 브랜치 별로 기억하기 때문에 여러 브랜치에서 각각 블로그 작성도 가능합니다.</li>
                            <li className="list_item">코드 품질 분석</li>
                            <li className="list_content">특정 시점을 찾아보고 체크섬을 제공할 필요 없이, DiFF는 스스로 마지막 블로그 작성 시점을 기억합니다.<br/>
                                각 브랜치 별로 기억하기 때문에 여러 브랜치에서 각각 블로그 작성도 가능합니다.</li>
                        </ol>
                    </div>
                    <div className="title2">1-2. 이용 대상</div>
                    <div className="content1">
                        학생뿐만 아니라 코드를 다루는 사람이라면 누구나 DiFF를 유용하게 사용할 것입니다.<br/><br/>
                        Git을 사용해보지 않은 사용자라면 Git과 DiFF를 배우는 것을 강력히 추천합니다. 이 둘은 생각보다 간단하고 유용합니다.
                    </div>
                    <div className="docsNavi">
                        <a href="../docs/start"><i className="fa-solid fa-arrow-left"></i> 이전글: 2. 시작하기</a>
                        <a href="../docs/option">다음글: 4. 옵션 <i className="fa-solid fa-arrow-right"></i></a>
                    </div>
                </main>
            </div>
        </div>
    );
}