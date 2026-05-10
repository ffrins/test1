/** 视口左下角的方向标 SVG（装饰用） */
export function Gizmo() {
  return (
    <div className="absolute bottom-4 left-4 w-12 h-12 pointer-events-none z-10 opacity-70">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <line x1="50" y1="50" x2="90" y2="50" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="50" x2="50" y2="10" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="50" x2="20" y2="80" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
        <text x="92" y="52" fontSize="12" fontWeight="bold" fill="#ef4444">X</text>
        <text x="45" y="8" fontSize="12" fontWeight="bold" fill="#22c55e">Y</text>
        <text x="12" y="90" fontSize="12" fontWeight="bold" fill="#3b82f6">Z</text>
      </svg>
    </div>
  );
}
