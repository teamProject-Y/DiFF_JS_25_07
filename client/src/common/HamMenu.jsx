export default function HamburgerButton({ open, onClick }) {
    return (
        <button
            onClick={onClick}
            className="relative w-9 h-9 group focus:outline-none"
            aria-label="메뉴 열기"
            tabIndex={0}
        >
            {/* 윗줄 */}
            <span
                className={`
                    absolute left-1/2 top-[35%] w-7 h-1 rounded bg-white transition-all duration-300
                `}
                style={{
                    transformOrigin: 'center center',
                    transform: open
                        ? 'translate(-50%, 140%) rotate(45deg)' // ⬅️ 아래로 이동 후 회전
                        : 'translate(-50%, -70%) rotate(0deg)'
                }}
            />
            {/* 아랫줄 */}
            <span
                className={`
                    absolute left-1/2 top-[65%] w-7 h-1 rounded bg-white transition-all duration-300
                `}
                style={{
                    transformOrigin: 'center center',
                    transform: open
                        ? 'translate(-50%, -140%) rotate(-45deg)' // ⬅️ 위로 이동 후 회전
                        : 'translate(-50%, -70%) rotate(0deg)'
                }}
            />
        </button>
    );
}
