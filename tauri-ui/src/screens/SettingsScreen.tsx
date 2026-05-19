import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";

interface ModelInfo { name: string; size_label: string; speed: string; }
interface Settings { language: string; model_file: string; quantization_tier: string; }

export default function SettingsScreen() {
  const [_settings, setSettings] = useState<Settings | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [language, setLanguage] = useState("english");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    Promise.all([
      apiGet<Settings>("/settings"),
      apiGet<ModelInfo[]>("/models"),
    ]).then(([s, m]) => {
      setSettings(s); setModels(m);
      setSelectedModel(s.model_file?.split("/").pop() || m[0]?.name || "");
      setLanguage(s.language || "english");
    }).catch(() => {});
  }, []);

  async function applyModel() {
    await apiPost("/settings", { key: "model_file", value: `./models/${selectedModel}` });
    flash("Model switched!");
  }

  async function applyLanguage(lang: string) {
    setLanguage(lang);
    await apiPost("/settings", { key: "language", value: lang });
    flash("Saved!");
  }

  function flash(msg: string) {
    setSaved(msg);
    setTimeout(() => setSaved(""), 2500);
  }

  return (
    <div className="h-full overflow-y-auto px-8 py-8 max-w-xl">
      <h2 className="text-white font-semibold text-lg mb-1">Settings</h2>
      <p className="text-slate-400 text-sm mb-8">Configure Aristotle AI</p>

      {/* model selector */}
      <section className="mb-8">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Model File</p>
        <p className="text-slate-400 text-xs mb-4">Smaller = faster, larger = smarter answers.</p>
        <div className="flex flex-col gap-3">
          {models.map(m => {
            const active = selectedModel === m.name;
            return (
              <button
                key={m.name}
                onClick={() => setSelectedModel(m.name)}
                className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                  active
                    ? "bg-blue-600/10 border-blue-500/50"
                    : "bg-white/3 border-white/8 hover:bg-white/5 hover:border-white/15"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  active ? "border-blue-400" : "border-slate-600"
                }`}>
                  {active && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${active ? "text-white" : "text-slate-300"}`}>{m.name}</p>
                  <p className="text-slate-500 text-xs">{m.size_label}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  m.speed === "fast"
                    ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                    : "text-amber-400 border-amber-500/30 bg-amber-500/10"
                }`}>
                  {m.speed === "fast" ? "Fast" : "High Quality"}
                </span>
              </button>
            );
          })}
        </div>
        <button
          onClick={applyModel}
          className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20"
        >
          Apply Model
        </button>
      </section>

      <div className="h-px bg-white/5 mb-8" />

      {/* language */}
      <section className="mb-8">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Language</p>
        <div className="flex gap-3">
          {[["english", "English"], ["urdu", "اردو (Urdu)"]] .map(([val, label]) => (
            <button
              key={val}
              onClick={() => applyLanguage(val)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                language === val
                  ? "bg-blue-600/15 border-blue-500/40 text-blue-300"
                  : "bg-white/3 border-white/8 text-slate-400 hover:text-slate-200 hover:border-white/20"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {saved && (
        <p className="text-emerald-400 text-sm fade-in">{saved}</p>
      )}
    </div>
  );
}
