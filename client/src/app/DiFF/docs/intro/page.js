import DocsSidebar from "@/app/DiFF/docs/docsSide";
import {ChevronRight} from "lucide-react";

export const metadata = { title: 'DiFF Docs — 1. 소개' };

export default function IntroPage() {
    return (
        <div className="min-h-screen dark:text-neutral-300">
            <div className="max-w-7xl px-8 flex">
                <div className="w-1/5">
                    <DocsSidebar />
                </div>
                <main className="prose prose-invert w-3/4 p-10">
                    <div className="title1">1. 소개</div>
                    <hr/>
                    <div className="content1">
                        이 서비스는 개발 학습자에 의해, 개발 학습자를 위해 만들어졌습니다.<br/><br/>
                        개발 공부와 기록을 병행하는 일은 생각보다 많은 시간이 듭니다. 기록은 단순히 뚝딱하면 나오는 게 아닙니다.
                        학습 과정에서 겪은 시행착오와 도전까지 모두 담으려면 꽤나 많은
                        시간이 소요되기도 합니다.<br/><br/>
                        우리는 이 문제로 어려움을 겪는 많은 학생들에게 도움을 주고자 DiFF를 만들었습니다.
                        DiFF는 개발 학습자의 공부 기록을 자동으로 수집·정리해 주는 플랫폼입니다.<br/><br/>
                        명령어 하나 또는 버튼 하나로 Git 저장소에서 코드 변경 사항(diff)을 추적하고, 이를 기반으로 자동 요약과 코드 스니펫을 생성하여 블로그 글 초안을 만들어 줍니다.
                        또한, 각 변경 시점마다 코드 품질을 분석하고 이를 대시보드로 시각화하여, 사용자가 자신의 성장 과정을 한눈에 확인할 수 있도록 돕습니다.
                    </div>

                    <div className="title2">1-1. 주요 특징</div>
                    <div className="content1">
                        <ol>
                            <li className="list_item">자동기록</li>
                            <li className="list_content">
                                특정 시점을 찾아보고 체크섬을 제공할 필요 없이, DiFF는 스스로 마지막 블로그 작성 시점을 기억합니다.<br/>
                                각 브랜치 별로 기억하기 때문에 여러 브랜치에서 각각 블로그 작성도 가능합니다.
                            </li>
                            <li className="list_item">블로그 초안 생성</li>
                            <li className="list_content">
                                특정 시점을 찾아보고 체크섬을 제공할 필요 없이, DiFF는 스스로 마지막 블로그 작성 시점을 기억합니다.<br/>
                                각 브랜치 별로 기억하기 때문에 여러 브랜치에서 각각 블로그 작성도 가능합니다.
                            </li>
                            <li className="list_item">코드 품질 분석</li>
                            <li className="list_content">
                                특정 시점을 찾아보고 체크섬을 제공할 필요 없이, DiFF는 스스로 마지막 블로그 작성 시점을 기억합니다.<br/>
                                각 브랜치 별로 기억하기 때문에 여러 브랜치에서 각각 블로그 작성도 가능합니다.
                            </li>
                        </ol>
                    </div>

                    <div className="title2">1-2. 이용 대상</div>
                    <div className="content1">
                        학생뿐만 아니라 코드를 다루는 사람이라면 누구나 DiFF를 유용하게 사용할 것입니다.<br/><br/>
                        Git을 사용해보지 않은 사용자라면 Git과 DiFF를 배우는 것을 강력히 추천합니다. 이 둘은 생각보다 간단하고 유용합니다.
                    </div>

                    <div className="docsNavi">
                        <a href="/DiFF/docs/start">
                            다음글: 2. 시작하기 <ChevronRight className="w-5 h-5 inline-block"/>
                        </a>
                    </div>
                </main>
            </div>
        </div>
    );
}
