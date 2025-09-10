import DocsSidebar from "@/app/DiFF/docs/docsSide";
import {ChevronLeft, ChevronRight} from "lucide-react";

export const metadata = { title: 'DiFF Docs — 4. 옵션' };

export default function StartPage() {
    return (
        <div className="min-h-screen dark:text-neutral-300">
            <div className="max-w-7xl px-8 flex">
                <div className="w-1/5">
                    <DocsSidebar />
                </div>
                <main className="prose prose-invert w-3/4 p-10">
                    <div className="title1">4. 옵션</div>
                    <hr/>
                    <div className="title2">4-1. 분석 제외</div>
                    <div className="content1">
                        코드 품질 분석은 매우 유용하고 실력 향상에 큰 서포터가 될 것입니다. <br/><br/>
                        하지만 큰 규모의 프로젝트라면 압축과 분석 시간이 많이 소요될 것이며, <br/>
                        또는 아직 코드 품질 점수를 제공하지 않는 언어를 사용하는 등
                        코드 품질 점수가 굳이 필요하지 않다면 분석 제외 옵션을 사용할 수 있습니다. <br/><br/>
                        <div className="p-4 rounded-xl bg-gray-100">
                            <div className="text-gray-400 mb-4">bash</div>
                            --no-analysis
                        </div>
                    </div>
                    <div className="title2">1-2. 이용 대상</div>
                    <div className="content1">
                        학생뿐만 아니라 코드를 다루는 사람이라면 누구나 DiFF를 유용하게 사용할 것입니다.<br/><br/>
                        Git을 사용해보지 않은 사용자라면 Git과 DiFF를 배우는 것을 강력히 추천합니다. 이 둘은 생각보다 간단하고 유용합니다.
                    </div>
                    <div className="docsNavi">
                        <a href="../docs/howto"><ChevronLeft className="w-5 h-5 inline-block"/> 이전글: 3. 사용법</a>
                        <a href="../docs/display">다음글: 5. 화면별 안내 <ChevronRight className="w-5 h-5 inline-block"/></a>
                    </div>
                </main>
            </div>
        </div>
    );
}