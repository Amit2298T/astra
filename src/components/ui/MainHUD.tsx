"use client";

interface MainHUDProps {
    onEnterFreeRoam: () => void;
}

export function MainHUD({ onEnterFreeRoam }: MainHUDProps) {
    return (
        <div
            style={{
                position: "absolute",
                top: 24,
                right: 24,
                zIndex: 20,
                display: "flex",
                gap: 12,
            }}
        >
            <button
                onClick={onEnterFreeRoam}
                style={{
                    background: "rgba(10, 12, 20, 0.85)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: 12,
                    color: "white",
                    padding: "10px 20px",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "rgba(59, 130, 246, 0.25)";
                    el.style.borderColor = "rgba(59, 130, 246, 0.5)";
                    el.style.color = "#93c5fd";
                }}
                onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = "rgba(10, 12, 20, 0.85)";
                    el.style.borderColor = "rgba(255, 255, 255, 0.15)";
                    el.style.color = "white";
                }}
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z" />
                </svg>
                Free Roam
            </button>
        </div>
    );
}
