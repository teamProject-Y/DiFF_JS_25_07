// pages/usr/member/modify.js
import { useState }  from "react"
import { useRouter } from "next/router"
import { getSession } from "next-auth/react"

export default function ModifyPage({ member }) {
    const router = useRouter()
    const [verified, setVerified] = useState(false)
    const [pw, setPw] = useState("")
    const [form, setForm] = useState({
        loginPw:   member?.loginPw   || "",
        name:      member?.name      || "",
        nickName:  member?.nickName  || "",
        cellPhone: member?.cellPhone || "",
        email:     member?.email     || "",
    })
    const [error, setError] = useState("")

    const handleVerify = async () => {
        setError("")
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/DiFF/member/checkPw?pw=${encodeURIComponent(pw)}`,
                { credentials: "include" }
            )
            const data = await res.json()
            if (data.resultCode === "S-1") setVerified(true)
            else setError("비밀번호가 일치하지 않습니다.")
        } catch {
            setError("검증 중 오류가 발생했습니다.")
        }
    }

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async e => {
        e.preventDefault()
        setError("")
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/DiFF/member/doModify`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(form),
                }
            )
            if (res.ok) router.push("/DiFF/member/myInfo")
            else {
                const text = await res.text()
                setError(text || "정보 수정에 실패했습니다")
            }
        } catch {
            setError("서버 요청 중 오류가 발생했습니다.")
        }
    }

    return (
        <div className="container mx-auto mt-10">
            <button
                onClick={() => router.back()}
                className="text-4xl pl-4 mb-4 cursor-pointer"
            >
                <i className="fa-solid fa-angle-left"></i>
            </button>

            {!verified ? (
                <div className="mx-auto max-w-min p-4 bg-neutral-200 border border-neutral-300 rounded-lg">
                    <h2 className="text-2xl font-semibold text-center mb-6">
                        Check Your Password
                    </h2>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <div className="flex flex-col items-center">
                        <input
                            type="password"
                            value={pw}
                            onChange={e => setPw(e.target.value)}
                            className="mb-6 w-96 p-2.5 border border-neutral-300 rounded-lg"
                            placeholder="Password"
                        />
                        <button
                            onClick={handleVerify}
                            className="py-2.5 px-5 w-96 bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700"
                        >
                            VERIFY
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mx-auto max-w-min p-8 bg-neutral-200 border border-neutral-300 rounded-lg">
                    <h2 className="text-2xl font-semibold text-center mb-6">
                        회원 정보 수정
                    </h2>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <form onSubmit={handleSubmit} className="flex flex-col items-center">
                        <input
                            name="loginId"
                            value={member.loginId}
                            disabled
                            className="mb-4 w-96 p-2.5 border border-neutral-300 rounded-lg bg-neutral-100"
                            placeholder="ID"
                        />
                        {/* 이하 기존 폼 필드들... */}
                        <button
                            type="submit"
                            className="py-2.5 px-5 w-96 bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700"
                        >
                            UPDATE
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}

ModifyPage.pageTitle = "MY INFO MODIFY"

// SSR 로 로그인 세션 확인 & member 데이터 페칭
export async function getServerSideProps(context) {
    const session = await getSession(context)
    if (!session) {
        return {
            redirect: {
                destination: "/DiFF/member/login",
                permanent: false,
            },
        }
    }

    // 로그인된 유저 ID 이용해 Spring Boot API로 member 정보 받아오기
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/DiFF/member/${session.user.id}`,
        {
            headers: { cookie: context.req.headers.cookie || "" },
        }
    )
    const member = await res.json()

    return {
        props: {
            session,
            member,
        },
    }
}
