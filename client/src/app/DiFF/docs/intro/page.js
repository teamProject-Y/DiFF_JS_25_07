import Link from "next/link";
import {ChevronRight} from "lucide-react";
import DocsSidebar from "@/app/DiFF/docs/docsSide";
import DocsViewer from "@/app/DiFF/docs/docsViewer";
export const metadata = { title: 'DiFF Docs — 1. 소개' };

export default function IntroPage() {
    const docContent = `
# 1. 소개
우하하
`;

    return (
        <div className="min-h-screen dark:text-neutral-300">
            <div className="px-8 flex">
                {/* 사이드바 */}
                <div className="w-1/5">
                    <DocsSidebar activeKey="/DiFF/docs/intro" />
                </div>

                {/* 메인 컨텐츠 */}
                <main className="flex-1 flex flex-col py-20 items-center
                    max-w-[640px] sm:max-w-[700px] md:max-w-[760px] lg:max-w-[820px] xl:max-w-[880px] px-4 sm:px-6 lg:px-10">
                    {/* Toast UI Viewer */}
                    <div className="toast-viewer">
                        <DocsViewer content={docContent} />
                    </div>

                    <div className="docsNavi">
                        <Link href="/DiFF/docs/start">
                            다음글: 2. 시작하기 <ChevronRight className="w-5 h-5 inline-block"/>
                        </Link>
                    </div>
                </main>
            </div>
        </div>
    );
}
