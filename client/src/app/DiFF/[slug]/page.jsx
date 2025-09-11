// app/DiFF/[slug]/page.jsx
import { redirect, notFound } from 'next/navigation'
import { bff } from '@/lib/bff'

export default async function Page({ params }) {
    const { slug } = params

    const map = {
        myProfile:  '/DiFF/member/myProfile',
        repository: '/DiFF/member/repository',
        settings:   '/DiFF/member/settings',
    }
    const apiPath = map[slug] ?? `/DiFF/home/${slug}`

    let res
    try {
        // Node 18+ 지원: fetch 타임아웃
        res = await bff(apiPath, { cache: 'no-store', signal: AbortSignal.timeout(8000) })
    } catch (e) {
        // 네트워크/타임아웃
        throw Object.assign(new Error('Upstream unreachable'), {
            status: e?.name === 'TimeoutError' ? 504 : 502
        })
    }

    if (res.status === 401) {
        redirect(`/DiFF/member/login?next=${encodeURIComponent(`/DiFF/${slug}`)}`)
    }
    if (res.status === 403) {
        redirect('/DiFF/member/forbidden') // 전용 페이지를 만들었을 때
    }
    if (res.status === 404) {
        notFound()
    }
    if (res.status === 204) {
        // 본문 없음
        return <article><h1>{slug}</h1></article>
    }
    if (res.status === 429) {
        throw Object.assign(new Error('Too Many Requests'), { status: 429 })
    }
    if (!res.ok) {
        // 나머지 4xx/5xx
        throw Object.assign(new Error('Upstream error'), { status: res.status })
    }

    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('application/json')) {
        throw Object.assign(new Error('Invalid content-type'), { status: 502 })
    }

    let data
    try {
        data = await res.json()
    } catch {
        throw Object.assign(new Error('Malformed JSON'), { status: 502 })
    }

    return <article><h1>{data.title ?? slug}</h1></article>
}
