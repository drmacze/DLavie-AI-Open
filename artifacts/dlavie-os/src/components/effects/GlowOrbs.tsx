export function GlowOrbs() {
  return (
    <div className="fixed inset-0 -z-9 overflow-hidden pointer-events-none">
      <div
        className="absolute rounded-full blur-3xl opacity-20 animate-pulse"
        style={{
          width: "60vw",
          height: "60vw",
          top: "-20vw",
          left: "-10vw",
          background: "radial-gradient(circle, #7c3aed 0%, #4f46e5 40%, transparent 70%)",
          animationDuration: "8s",
        }}
      />
      <div
        className="absolute rounded-full blur-3xl opacity-15"
        style={{
          width: "50vw",
          height: "50vw",
          bottom: "-15vw",
          right: "-10vw",
          background: "radial-gradient(circle, #db2777 0%, #9333ea 40%, transparent 70%)",
          animation: "pulse 11s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute rounded-full blur-2xl opacity-10"
        style={{
          width: "30vw",
          height: "30vw",
          top: "30%",
          left: "30%",
          background: "radial-gradient(circle, #0ea5e9 0%, #6366f1 50%, transparent 70%)",
          animation: "pulse 14s ease-in-out infinite",
        }}
      />
    </div>
  );
}
