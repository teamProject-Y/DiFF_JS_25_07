import DocsSidebar from "@/app/DiFF/docs/docsSide";
import {ChevronLeft, ChevronRight} from "lucide-react";
import DocsViewer from "@/app/DiFF/docs/docsViewer";

export const metadata = { title: 'DiFF Docs — 2. 시작하기' };

export default function StartPage() {
    const docContent = `
# 시작하기
로그인 하고 회원가입하고
`;

    return (
        <div className="min-h-screen dark:text-neutral-300">
            <div className="px-8 flex">
                {/* 사이드바 */}
                <div className="w-1/5">
                    <DocsSidebar activeKey="/DiFF/docs/start" />
                </div>

                {/* 메인 컨텐츠 */}
                <main className="flex-1 flex flex-col py-20 items-center
                    max-w-[640px] sm:max-w-[700px] md:max-w-[760px] lg:max-w-[820px] xl:max-w-[880px] px-4 sm:px-6 lg:px-10">
                    {/* Toast UI Viewer */}
                    <div className="toast-viewer">
                        <DocsViewer content={docContent} />
                    </div>
                    <div className="docsNavi">
                        <a href="../docs/intro" className="flex items-center gap-2"><ChevronLeft className="w-5 h-5"/> 이전글: 1. 소개</a>
                        <a href="../docs/howto" className="flex items-center gap-2">다음글: 3. 사용법 <ChevronRight className="w-5 h-5"/></a>
                    </div>
                </main>
            </div>
        </div>
    );
}