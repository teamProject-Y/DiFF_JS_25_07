// 'use client';
//
// import dynamic from 'next/dynamic';
// import { Navigation, Pagination, A11y, Autoplay, EffectFade } from 'swiper/modules';
// import 'swiper/css';
// import 'swiper/css/navigation';
// import 'swiper/css/pagination';
// import 'swiper/css/effect-fade';
//
// const Swiper = dynamic(() => import('swiper/react').then(m => m.Swiper), { ssr: false });
// const SwiperSlide = dynamic(() => import('swiper/react').then(m => m.SwiperSlide), { ssr: false });
//
// export default function HeroSwiper({ slides = [] }) {
//     const total = slides.length || 0;
//     let current = 1;
//
//     return (
//         <section className="sec01">
//             <Swiper
//                 modules={[Navigation, Pagination, A11y, Autoplay, EffectFade]}
//                 effect="fade"
//                 fadeEffect={{ crossFade: true }}
//                 speed={1200}
//                 loop
//                 autoplay={{ delay: 4000, disableOnInteraction: false }}
//                 navigation={{
//                     prevEl: '.sec01 .swiper-button-prev',
//                     nextEl: '.sec01 .swiper-button-next',
//                 }}
//                 onInit={(sw) => {
//                     const el = document.querySelector('.sec01 .custom-pagination .current');
//                     if (el) el.textContent = String((sw.realIndex ?? 0) + 1);
//                 }}
//                 onSlideChange={(sw) => {
//                     const el = document.querySelector('.sec01 .custom-pagination .current');
//                     if (el) el.textContent = String((sw.realIndex ?? 0) + 1);
//                 }}
//                 className="main-swiper swiper-fade"
//             >
//                 {slides.map((s, i) => (
//                     <SwiperSlide key={i}>
//                         <div className="bg">
//                             <div className="img">
//                                 <span className="pc" style={{ background: `url(${s.pc}) no-repeat 0 0` }} />
//                                 <span className="mo" style={{ background: `url(${s.mo}) no-repeat 0 0` }} />
//                             </div>
//                         </div>
//                         <div className="sec01-div01">
//                             <div>
//                                 <p className="sec01-txt01" dangerouslySetInnerHTML={{ __html: s.title1 }} />
//                                 {s.title2 && <p className="sec01-txt2" dangerouslySetInnerHTML={{ __html: s.title2 }} />}
//                             </div>
//                         </div>
//                         {Array.isArray(s.links) && s.links.length > 0 && (
//                             <ul className="sec01-div02">
//                                 {s.links.map((l, k) => <li key={k}><a href={l.href}>{l.label}</a></li>)}
//                             </ul>
//                         )}
//                     </SwiperSlide>
//                 ))}
//             </Swiper>
//
//             <div className="navi-bar">
//                 <div className="custom-pagination">
//                     <strong><span className="current">{current}</span></strong>
//                     <span className="span-bar">/</span>
//                     <span>{total}</span>
//                 </div>
//                 <div className="swiper-btn">
//                     <button className="pausebtn" onClick={() => window.__hero_swiper?.autoplay?.stop?.()}>멈춤</button>
//                     <button className="playbtn"  onClick={() => window.__hero_swiper?.autoplay?.start?.()}>재생</button>
//                 </div>
//                 <div className="swiper-button-prev" />
//                 <div className="swiper-button-next" />
//             </div>
//         </section>
//     );
// }
