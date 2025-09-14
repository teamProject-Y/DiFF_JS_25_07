import DocsSidebar from "../docsSide";
import { ChevronRight } from "lucide-react";
import DocsViewer from "../docsViewer";

export const metadata = { title: "DiFF Docs — 5. 분석" };

export default function AnalysisPage() {
    const docContent = `
# 5. 분석

## 5-1. 분석 방법
1. **분석은 어떻게 되는건가요?**  
분석은 사용자가 CLI 환경, 리포지토리에 있는 makeDraft 버튼 클릭 시 diff 변경 사항을 추출하면서 같이 진행된다.  
분석은 사용자가 업로드했을 때만 게시글에 나타나며, 임시저장 목록에는 나오지 않는다.  

2. **분석 점수는 어떻게 산정되나요?**  
분석 점수는 보안, 신뢰성, 유지보수성, 테스트 커버리지, 중복율, 복잡도 총 6개 지표를 종합하여 평가된다.  

- **Coverage (테스트 커버리지)**: 단위 테스트가 전체 코드에서 차지하는 비율  
- **Bugs (버그 지표)**: 프로젝트 내부에서 탐지한 잠재적 버그 수  
- **Vulnerabilities (보안 취약점)**: 보안 위험 코드 패턴의 개수  
- **Code Smells (코드 스멜)**: 유지보수에 악영향을 주는 코드 패턴  
- **Complexity (복잡도)**: 함수/메서드의 순환 복잡도  
- **Duplicated Lines Density (중복 코드 비율)**: 전체 코드에서 중복된 라인의 비율  

각 지표는 A~E 등급으로 환산된 뒤 점수화되어 평균이 산출되며,  
최종적으로 프로젝트의 총합 품질 등급이 전체, 최근, 게시물별로 표시된다.  

3. **분석 언어**  
DiFF는 현재 다음 언어들을 지원한다.  
Java, JavaScript, TypeScript, HTML, CSS, PHP, Python, XML, JSON, YAML, Kotlin, Swift, Ruby, Go  
C언어 계열은 지원하지 않는다.
`;

    return (
        <div className="min-h-screen dark:text-neutral-300">
            <div className="max-w-7xl px-8 flex">
                {/* 사이드바 */}
                <div className="w-1/5">
                    <DocsSidebar activeKey="/DiFF/docs/analysis" />
                </div>

                {/* 메인 컨텐츠 */}
                <main className="w-3/4 p-10">
                    {/* Toast UI Viewer */}
                    <div className="toast-viewer dark:text-neutral-300">
                        <DocsViewer content={docContent} />
                    </div>

                    {/* 네비게이션 */}
                    <div className="docsNavi mt-8">
                        <a href="../docs/account">
                            <ChevronRight className="w-5 h-5 inline-block" /> 이전글: 6. 계정 및 보안
                        </a>
                    </div>
                </main>
            </div>
        </div>
    );
}
