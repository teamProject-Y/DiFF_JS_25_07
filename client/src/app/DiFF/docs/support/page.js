import DocsSidebar from "@/common/docsSide";

export const metadata = { title: 'DiFF Docs — 7. 지원' };

export default function StartPage() {
    return (
        <div className="min-h-screen">
            <div className="max-w-7xl p-8 flex">
                <div className="w-1/5">
                    <DocsSidebar />
                </div>
                <main className="prose prose-invert w-2/3 p-10">
                    <div className="title1">7. 지원</div>
                    <hr/>
                    <div className="title2">7-1. FAQ
                    </div>
                    <div className="content1">
                        <ol>
                            <li className="list_item">diff가 추출이 안돼요</li>
                            <li className="list_content">diff가 너무 긴 경우 안될 수 있습니다. .DiFF의 meta파일에서 체크섬을 적절하게 수정하여 사용하세요.</li>
                            <li className="list_item">초안이 안만들어져요</li>
                            <li className="list_content">잘 모르겠어요.</li>
                            <li className="list_item">이메일을 찾을 수 없다고 떠요</li>
                            <li className="list_content">먼저 DiFF 서비스에 가입을 해야 사용하실 수 있습니다.
                            또한 git을 사용 중이어야하며, git에 로그인이 되었는 지 확인 후 다시 시도해보세요.<br/>
                                (확인 명령어: git config user.name)</li>
                        </ol>
                    </div>
                    <div className="title2">7-2. contact</div>
                    <div className="content1">
                        email: help@diff.com<br/>
                        tel: 010-1234-1234<br/>
                        address: The Wall of Shiganshina
                    </div>
                    <div className="docsNavi">
                        <a href="../docs/account"><i className="fa-solid fa-arrow-left"></i> 이전글: 6. 계정 및 보안</a>
                    </div>
                </main>
            </div>
        </div>
    );
}