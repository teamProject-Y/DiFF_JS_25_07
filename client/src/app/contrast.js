// src/contrast.js

// hex(#RGB, #RRGGBB, #RRGGBBAA) / rgb()/rgba() 문자열 지원
function toRGB(color) {
    if (!color || typeof color !== "string") return null;
    const c = color.trim();

    // #RGB, #RRGGBB, #RRGGBBAA
    if (c[0] === "#") {
        const hex = c.slice(1);
        if (hex.length === 3) {
            const r = parseInt(hex[0] + hex[0], 16);
            const g = parseInt(hex[1] + hex[1], 16);
            const b = parseInt(hex[2] + hex[2], 16);
            return [r, g, b];
        }
        if (hex.length === 6 || hex.length === 8) {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            // 알파(hex 8자리)는 무시(불투명 배경 가정). 필요하면 합성 로직 추가.
            return [r, g, b];
        }
        return null;
    }

    // rgb / rgba
    const m = c.match(/rgba?\s*\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*([0-9.]+))?\s*\)/i);
    if (m) {
        const r = Math.min(255, parseFloat(m[1]));
        const g = Math.min(255, parseFloat(m[2]));
        const b = Math.min(255, parseFloat(m[3]));
        return [r, g, b];
    }

    return null; // 다른 형식은 지원 X (hsl, color name 등)
}

function luminanceFromRGB([r, g, b]) {
    const toLinear = (v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    const R = toLinear(r);
    const G = toLinear(g);
    const B = toLinear(b);
    // sRGB 상대휘도
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * 배경색에 대비되는 텍스트 색을 반환합니다.
 * @param {string} bg - '#fff' / '#ffffff' / 'rgb(…)' / 'rgba(…)' 등
 * @param {object} opts
 * @param {string} opts.light - 밝은 텍스트 색 (기본 '#ffffff')
 * @param {string} opts.dark  - 어두운 텍스트 색 (기본 '#111111')
 * @param {number} opts.threshold - 밝기 임계값 0~1 (기본 0.55)
 */
export function getContrastColor(bg, opts = {}) {
    const { light = "#ffffff", dark = "#111111", threshold = 0.55 } = opts;
    const rgb = toRGB(bg);
    if (!rgb) return dark; // 파싱 실패 시 기본 어두운 글자색

    const L = luminanceFromRGB(rgb);
    return L > threshold ? dark : light;
}

/**
 * 루트 엘리먼트에 CSS 변수로 자동 대비 색을 주입합니다. (선택)
 * @example: root.style.color = 'var(--auto-fg)'
 */
export function applyAutoContrast(root, bg, opts) {
    if (!root) return;
    const fg = getContrastColor(bg, opts);
    root.style.setProperty("--auto-fg", fg);
    return fg;
}
