'use client';

import {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import useModalOpenIntro from './modalOpenAnime';


export default function ModalOpenUiverse({
                                             open,
                                             text = 'DiFF',
                                             animationColor = '#fff',
                                             strokeColor = 'rgba(255,255,255,0.6)',
                                             borderRight = 7,         // px
                                             fontSize = '8em',
                                             mountBgClass = 'bg-[#1F1D1B] rounded-3xl',
                                             durationMs = 500,
                                             bufferMs = 450,
                                             onDone,
                                         }) {
    const [visible, setVisible] = useState(false);
    const [play, setPlay] = useState(false);

    const {coverCtrl, coverVariants,
    } = useModalOpenIntro(open);

    useEffect(() => {
        if (!open) return;

        setVisible(true);

        const t1 = setTimeout(() => setPlay(true), 30);

        const t2 = setTimeout(() => {
            setPlay(false);
            setVisible(false);
            onDone?.();
        }, durationMs + bufferMs);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [open, durationMs, bufferMs, onDone]);

    if (!visible) return null;

    return (
        <>
        <div className={`pointer-events-none absolute inset-0 z-50 flex items-center justify-center ${mountBgClass}`}>
            <button
                className={`button${play ? ' play' : ''}`}
                data-text={text}
                aria-hidden
                style={{
                    '--animation-color': animationColor,
                    '--text-stroke-color': strokeColor,
                    '--border-right': `${borderRight}px`,
                    '--fs-size': fontSize,
                }}
            >
                <span className="actual-text">&nbsp;{text}&nbsp;</span>
                <span aria-hidden="true" className="hover-text">&nbsp;{text}&nbsp;</span>
            </button>

            <style jsx global>{`

                .button {
                    margin: 0;
                    height: auto;
                    background: transparent;
                    padding: 0;
                    border: none;
                    cursor: pointer;
                }

                .button {
                    --border-right: 6px;
                    letter-spacing: 3px;
                    text-decoration: none;
                    font-size: var(--fs-size);
                    font-family: 'Pretendard-Regular';
                    font-weight: 1000;
                    position: relative;
                    text-transform: none;
                    color: transparent;
                    -webkit-text-stroke: 1px var(--text-stroke-color, rgba(0, 0, 0, 0.6));
                }

                .button .actual-text {
                    color: transparent;
                    -webkit-text-stroke: 1px var(--text-stroke-color, rgba(0, 0, 0, 0.6));
                }

                .hover-text {
                    position: absolute;
                    box-sizing: border-box;
                    content: attr(data-text);
                    color: var(--animation-color, #fff);
                    width: 0%;
                    inset: 0;
                    border-right: var(--border-right) solid var(--animation-color, #fff);
                    overflow: hidden;
                    transition: width 0.7s;
                    -webkit-text-stroke: 1px var(--animation-color, #fff);
                }
        
                .button.play .hover-text {
                    width: 100%;
                    filter: drop-shadow(0 0 23px var(--animation-color, #fff));
                }
            `}</style>
        </div>

    <motion.div
        className="pointer-events-none absolute inset-0 z-40 rounded-3xl bg-white"
        variants={coverVariants}
        initial="initial"
        animate={coverCtrl}
    />
            </>
    );
}
