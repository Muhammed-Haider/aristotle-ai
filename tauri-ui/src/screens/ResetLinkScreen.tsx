import { AuthLeft } from "./_AuthShared";

interface Props {
  onBack: () => void;
  onHome: () => void;
}

export default function ResetLinkScreen({ onBack, onHome }: Props) {
  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <AuthLeft
        title="Need Help?"
        subtitle="Don't worry! We'll send you a secure link to reset your password and get you back to learning"
      />

      <div className="flex-1 flex flex-col items-center justify-center bg-[#0d1117] px-12 relative">
        <div className="w-full max-w-sm fade-in text-center">
          {/* checkmark icon */}
          <div className="flex justify-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
          <p className="text-[#8899b0] text-sm mb-1">We've sent password reset instructions to</p>
          <p className="text-[#8899b0] text-sm mb-6">Didn't receive the email? Check your spam folder or try again</p>

          <div className="flex flex-col gap-3">
            <button className="btn-secondary w-full">
              Resend Email
            </button>
            <button onClick={onBack} className="btn-primary">
              Back to Sign In
            </button>
          </div>
        </div>

        <button onClick={onHome}
          className="absolute bottom-6 left-8 flex items-center gap-1.5 text-sm text-[#8899b0] hover:text-white transition-colors">
          <span>←</span> Back to home
        </button>
      </div>
    </div>
  );
}
