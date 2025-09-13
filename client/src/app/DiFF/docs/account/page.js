import DocsSidebar from "@/app/DiFF/docs/docsSide";
import {ChevronLeft, ChevronRight} from "lucide-react";
import DocsViewer from "@/app/DiFF/docs/docsViewer";

export const metadata = { title: 'DiFF Docs — 6. 계정/보안' };

export default function StartPage() {

    const docContent = `
# 6. 계정 및 보안

## 6-1. 계정을 지켜라
지킨다면 행복할 것이니
`;

    return (
        <div className="min-h-screen dark:text-neutral-300">
            <div className="px-8 flex">
                {/* 사이드바 */}
                <div className="w-1/5">
                    <DocsSidebar activeKey="/DiFF/docs/account" />
                </div>

                {/* 메인 컨텐츠 */}
                <main className="flex-1 flex flex-col py-20 items-center
                    max-w-[640px] sm:max-w-[700px] md:max-w-[760px] lg:max-w-[820px] xl:max-w-[880px] px-4 sm:px-6 lg:px-10">
                    {/* Toast UI Viewer */}
                    <div className="toast-viewer">
                        <DocsViewer content={docContent} />
                    </div>
                    <div className="docsNavi">
                        <a href="../docs/display"><ChevronLeft className="w-5 h-5 inline-block"/> 이전글: 5. 화면별 안내</a>
                        <a href="../docs/support">다음글: 7. 지원 <ChevronRight className="w-5 h-5 inline-block"/></a>
                    </div>
                </main>
            </div>
        </div>
    );
}