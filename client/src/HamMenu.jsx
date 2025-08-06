export default function HamburgerButton({ open, onClick }) {
    return (
        <button
            onClick={onClick}
            className="relative w-9 h-9 group focus:outline-none"
            aria-label="메뉴 열기"
            tabIndex={0}
        >
      <span
          className={`
          absolute left-1/2 top-[35%] w-7 h-1 rounded bg-white transition-all duration-300
          ${open ? "rotate-45 top-1/2" : ""}
        `}
          style={{
              transform: open
                  ? "translate(-50%, -50%) rotate(45deg)"
                  : "translate(-50%, -50%) rotate(0)"
          }}
      />
            <span
                className={`
          absolute left-1/2 top-[65%] w-7 h-1 rounded bg-white transition-all duration-300
          ${open ? "-rotate-45 top-1/2" : ""}
        `}
                style={{
                    transform: open
                        ? "translate(-50%, -50%) rotate(-45deg)"
                        : "translate(-50%, -50%) rotate(0)"
                }}
            />
        </button>
    );
}
