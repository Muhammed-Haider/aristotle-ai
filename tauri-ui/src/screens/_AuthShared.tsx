export function BrainIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.44-3.14z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.44-3.14z"/>
    </svg>
  );
}

interface AuthLeftProps {
  title: string;
  subtitle: string;
}

export function AuthLeft({ title, subtitle }: AuthLeftProps) {
  return (
    <div className="auth-left w-[42%] shrink-0 flex flex-col items-center justify-center px-12">
      <div className="w-16 h-16 rounded-2xl bg-[#2563eb] flex items-center justify-center mb-8 shadow-xl"
        style={{ boxShadow: "0 0 40px rgba(37,99,235,0.4)" }}>
        <BrainIcon size={32} />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4 text-center">{title}</h2>
      <p className="text-[#8899b0] text-sm text-center leading-relaxed max-w-xs">{subtitle}</p>
    </div>
  );
}
