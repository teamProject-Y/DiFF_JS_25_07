// app/DiFF/[slug]/page.jsx
import { redirect, notFound } from 'next/navigation'
import { bff } from '@/lib/bff'

export default async function Page({ params }) {
    const { slug } = params

    const apiPath = ({
        myProfile:  '/DiFF/member/myProfile',
        repository: '/DiFF/member/repository',
        settings: '/DiFF/member/settings',
    }[slug]) ?? `/DiFF/home/${slug}`;

    const res = await bff(apiPath, { cache: 'no-store' })
        .catch(() => ({ ok:false, status:500 }))

    if (res.status === 401) {
        redirect(`/DiFF/member/login?next=${encodeURIComponent(`/DiFF/${slug}`)}`)
    }

    if (res.status === 404) notFound()
    if (!res.ok) throw new Error(`Failed: ${res.status}`)

    const data = await res.json()
    return <article><h1>{data.title ?? slug}</h1></article>
}
