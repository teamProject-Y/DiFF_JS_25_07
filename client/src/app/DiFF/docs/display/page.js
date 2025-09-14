import DocsSidebar from "@/app/DiFF/docs/docsSide";
import {ChevronLeft, ChevronRight} from "lucide-react";
import DocsViewer from "@/app/DiFF/docs/docsViewer";

export const metadata = { title: 'DiFF Docs — 5. 화면 상세' };

export default function StartPage() {

    const docContent = `
# 이 페이지 필요 없으니 지울까요
`;

    return (
        <div className="min-h-screen dark:text-neutral-300">
            <div className="px-8 flex">
                {/* 사이드바 */}
                <div className="w-1/5">
                    <DocsSidebar activeKey="/DiFF/docs/display" />
                </div>

                {/* 메인 컨텐츠 */}
                <main className="flex-1 flex flex-col py-20 items-center
                max-w-[640px] sm:max-w-[700px] md:max-w-[760px] lg:max-w-[820px] xl:max-w-[880px] px-4 sm:px-6 lg:px-10">
                    {/* Toast UI Viewer */}
                    <div className="toast-viewer">
                        <DocsViewer content={docContent} />
                    </div>
                    <div className="docsNavi">
                        <a href="../docs/option"><ChevronLeft className="w-5 h-5 inline-block"/> 이전글: 4. 옵션</a>
                        <a href="../docs/account">다음글: 6. 계정 및 보안 <ChevronRight className="w-5 h-5 inline-block"/></a>
                    </div>
                </main>
            </div>
        </div>
    );
}