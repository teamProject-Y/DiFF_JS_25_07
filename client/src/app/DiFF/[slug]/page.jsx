// app/DiFF/[slug]/page.jsx
import { redirect, notFound } from 'next/navigation'
import { bff } from '@/lib/bff'

export const dynamic = 'force-dynamic'; // 캐시/정적최적화 회피(안전장치)

export default async function Page({ params }) {
    const { slug } = params

    const map = {
        myProfile:  '/DiFF/member/profile',
        repository: '/DiFF/member/repository',
        settings:   '/DiFF/member/settings',
    }
    const apiPath = map[slug] ?? `/DiFF/home/${slug}`

    let res
    try {
        res = await bff(apiPath, { signal: AbortSignal.timeout(8000) })
    } catch (e) {
        throw Object.assign(new Error('Upstream unreachable'), {
            status: e?.name === 'TimeoutError' ? 504 : 502
        })
    }

    console.log('[status]', res.status,
        'location:', res.headers.get('location'),
        'ctype:', res.headers.get('content-type'));

    // 🔎 여기서 3xx를 직접 잡아 404로 보낼 수 있음
    if (res.status >= 300 && res.status < 400) {
        console.error('[redirect caught]', res.status, res.headers.get('location'))
        notFound() // (원하면 여기서 로그인 redirect로 바꿔도 됨)
    }

    if (res.status === 401 || res.status === 403 || res.status === 404) {
        notFound()
    }
    if (res.status === 429) {
        throw Object.assign(new Error('Too Many Requests'), { status: 429 })
    }
    if (res.status === 204) {
        return <article><h1>{slug}</h1></article>
    }
    if (!res.ok) {
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
