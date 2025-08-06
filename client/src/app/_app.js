// // pages/_app.js
// import Script from 'next/script'
// import Layout from '@/common/layout'
//
// export default function App({ Component, pageProps }) {
//     // const { session, member, ...rest } = pageProps
//     return (
//         <>
//             {/* jQuery를 hydration 전에 불러오기 */}
//             <Script
//                 src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"
//                 strategy="beforeInteractive"
//             />
//                 <Layout>
//                     <Component {...pageProps} />
//                 </Layout>
//         </>
//     )
// }