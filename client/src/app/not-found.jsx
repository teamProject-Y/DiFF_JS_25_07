// app/DiFF/not-found.jsx
import ErrorScreen from "@/common/screen/errorScreen";

export default function NotFound() {
    return (
        <ErrorScreen
            code="404"
            title="Error"
            message="The page you are looking for might have been removed, had its name changed or is temporarily unavailable."
            homeHref="/DiFF/home/main"  // 네 프로젝트 홈으로 맞춤
        />
    );
}
