// 사용자가 선택할 수 있는 전체 후보 목록 (원하면 더 추가 가능)
export const BADGE_MAP = {
    java:        { label: "Java", url: "https://img.shields.io/badge/Java-ED8B00?style=flat-square&logo=openjdk&logoColor=white" },
    kotlin:      { label: "Kotlin", url: "https://img.shields.io/badge/Kotlin-7F52FF?style=flat-square&logo=kotlin&logoColor=white" },
    python:      { label: "Python", url: "https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" },
    javascript:  { label: "JavaScript", url: "https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" },
    typescript:  { label: "TypeScript", url: "https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" },
    c:           { label: "C", url: "https://img.shields.io/badge/C-00599C?style=flat-square&logo=c&logoColor=white" },
    cpp:         { label: "C++", url: "https://img.shields.io/badge/C%2B%2B-00599C?style=flat-square&logo=c%2B%2B&logoColor=white" },
    csharp:      { label: "C#", url: "https://img.shields.io/badge/C%23-239120?style=flat-square&logo=csharp&logoColor=white" },
    ruby:        { label: "Ruby", url: "https://img.shields.io/badge/Ruby-CC342D?style=flat-square&logo=ruby&logoColor=white" },
    php:         { label: "PHP", url: "https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white" },
    swift:       { label: "Swift", url: "https://img.shields.io/badge/Swift-FA7343?style=flat-square&logo=swift&logoColor=white" },
    go:          { label: "Go", url: "https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white" },
    rust:        { label: "Rust", url: "https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white" },
    dart:        { label: "Dart", url: "https://img.shields.io/badge/Dart-0175C2?style=flat-square&logo=dart&logoColor=white" },
    scala:       { label: "Scala", url: "https://img.shields.io/badge/Scala-DC322F?style=flat-square&logo=scala&logoColor=white" },

    // 프론트엔드
    html5:       { label: "HTML5", url: "https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" },
    css3:        { label: "CSS3", url: "https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" },
    react:       { label: "React", url: "https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" },
    nextjs:      { label: "Next.js", url: "https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" },
    vue:         { label: "Vue.js", url: "https://img.shields.io/badge/Vue.js-4FC08D?style=flat-square&logo=vue.js&logoColor=white" },
    nuxt:        { label: "Nuxt.js", url: "https://img.shields.io/badge/Nuxt.js-00DC82?style=flat-square&logo=nuxtdotjs&logoColor=white" },
    angular:     { label: "Angular", url: "https://img.shields.io/badge/Angular-DD0031?style=flat-square&logo=angular&logoColor=white" },
    svelte:      { label: "Svelte", url: "https://img.shields.io/badge/Svelte-FF3E00?style=flat-square&logo=svelte&logoColor=white" },
    bootstrap:   { label: "Bootstrap", url: "https://img.shields.io/badge/Bootstrap-7952B3?style=flat-square&logo=bootstrap&logoColor=white" },
    tailwind:    { label: "Tailwind CSS", url: "https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" },
    mui:         { label: "MUI", url: "https://img.shields.io/badge/MUI-007FFF?style=flat-square&logo=mui&logoColor=white" },

    // 백엔드 & 프레임워크
    spring:      { label: "Spring", url: "https://img.shields.io/badge/Spring-6DB33F?style=flat-square&logo=spring&logoColor=white" },
    springboot:  { label: "Spring Boot", url: "https://img.shields.io/badge/Spring%20Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white" },
    nodejs:      { label: "Node.js", url: "https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" },
    express:     { label: "Express.js", url: "https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white" },
    django:      { label: "Django", url: "https://img.shields.io/badge/Django-092E20?style=flat-square&logo=django&logoColor=white" },
    flask:       { label: "Flask", url: "https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white" },
    fastapi:     { label: "FastAPI", url: "https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" },
    rubyrails:   { label: "Rails", url: "https://img.shields.io/badge/Ruby%20on%20Rails-CC0000?style=flat-square&logo=rubyonrails&logoColor=white" },
    laravel:     { label: "Laravel", url: "https://img.shields.io/badge/Laravel-FF2D20?style=flat-square&logo=laravel&logoColor=white" },

    // 데이터베이스
    mysql:       { label: "MySQL", url: "https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white" },
    mariadb:     { label: "MariaDB", url: "https://img.shields.io/badge/MariaDB-003545?style=flat-square&logo=mariadb&logoColor=white" },
    postgresql:  { label: "PostgreSQL", url: "https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" },
    mongodb:     { label: "MongoDB", url: "https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" },
    redis:       { label: "Redis", url: "https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white" },
    oracle:      { label: "Oracle", url: "https://img.shields.io/badge/Oracle-F80000?style=flat-square&logo=oracle&logoColor=white" },

    // 클라우드 & DevOps
    docker:      { label: "Docker", url: "https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" },
    kubernetes:  { label: "Kubernetes", url: "https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white" },
    aws:         { label: "AWS", url: "https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazonaws&logoColor=white" },
    azure:       { label: "Azure", url: "https://img.shields.io/badge/Azure-0078D4?style=flat-square&logo=microsoftazure&logoColor=white" },
    gcp:         { label: "Google Cloud", url: "https://img.shields.io/badge/Google%20Cloud-4285F4?style=flat-square&logo=googlecloud&logoColor=white" },
    firebase:    { label: "Firebase", url: "https://img.shields.io/badge/Firebase-FFCA28?style=flat-square&logo=firebase&logoColor=black" },
    nginx:       { label: "Nginx", url: "https://img.shields.io/badge/Nginx-009639?style=flat-square&logo=nginx&logoColor=white" },
    apache:      { label: "Apache", url: "https://img.shields.io/badge/Apache-D22128?style=flat-square&logo=apache&logoColor=white" },

    // 툴 & 협업
    git:         { label: "Git", url: "https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white" },
    github:      { label: "GitHub", url: "https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" },
    gitlab:      { label: "GitLab", url: "https://img.shields.io/badge/GitLab-FC6D26?style=flat-square&logo=gitlab&logoColor=white" },
    bitbucket:   { label: "Bitbucket", url: "https://img.shields.io/badge/Bitbucket-0052CC?style=flat-square&logo=bitbucket&logoColor=white" },
    jira:        { label: "Jira", url: "https://img.shields.io/badge/Jira-0052CC?style=flat-square&logo=jira&logoColor=white" },
    confluence:  { label: "Confluence", url: "https://img.shields.io/badge/Confluence-172B4D?style=flat-square&logo=confluence&logoColor=white" },
    slack:       { label: "Slack", url: "https://img.shields.io/badge/Slack-4A154B?style=flat-square&logo=slack&logoColor=white" },
    notion:      { label: "Notion", url: "https://img.shields.io/badge/Notion-000000?style=flat-square&logo=notion&logoColor=white" },
    figma:       { label: "Figma", url: "https://img.shields.io/badge/Figma-F24E1E?style=flat-square&logo=figma&logoColor=white" },
    vscode:      { label: "VS Code", url: "https://img.shields.io/badge/VS%20Code-007ACC?style=flat-square&logo=visual-studio-code&logoColor=white" },
    intellij:    { label: "IntelliJ IDEA", url: "https://img.shields.io/badge/IntelliJIDEA-000000?style=flat-square&logo=intellijidea&logoColor=white" },
    eclipse:     { label: "Eclipse", url: "https://img.shields.io/badge/Eclipse-2C2255?style=flat-square&logo=eclipseide&logoColor=white" },

    // 모바일 & 게임
    android:     { label: "Android", url: "https://img.shields.io/badge/Android-3DDC84?style=flat-square&logo=android&logoColor=white" },
    ios:         { label: "iOS", url: "https://img.shields.io/badge/iOS-000000?style=flat-square&logo=apple&logoColor=white" },
    flutter:     { label: "Flutter", url: "https://img.shields.io/badge/Flutter-02569B?style=flat-square&logo=flutter&logoColor=white" },
    reactnative: { label: "React Native", url: "https://img.shields.io/badge/React%20Native-61DAFB?style=flat-square&logo=react&logoColor=black" },
    unity:       { label: "Unity", url: "https://img.shields.io/badge/Unity-FFFFFF?style=flat-square&logo=unity&logoColor=black" },
    unreal:      { label: "Unreal Engine", url: "https://img.shields.io/badge/Unreal%20Engine-0E1128?style=flat-square&logo=unrealengine&logoColor=white" },

};
export const BADGE_KEYS = Object.keys(BADGE_MAP);
