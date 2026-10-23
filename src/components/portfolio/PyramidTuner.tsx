import { useState } from "react";
import { PYRAMID, type PyramidConfig } from "./pyramid-config";

type Knob = { key: keyof PyramidConfig; label: string; min: number; max: number; step: number; hint: string };

const KNOBS: Knob[] = [
  { key: "altura", label: "Altura", min: 0.6, max: 1.4, step: 0.01, hint: "1 = contorno igual ao triângulo" },
  { key: "perspectiva", label: "Perspectiva", min: 0, max: 4000, step: 50, hint: "0 = base parada numa linha" },
  { key: "giro", label: "Giro (graus)", min: -720, max: 720, step: 15, hint: "negativo gira para a esquerda" },
  { key: "paradaNoLugar", label: "Parada no lugar", min: 0, max: 0.9, step: 0.05, hint: "parte do giro antes de andar" },
  { key: "saida", label: "Saída", min: 0.5, max: 2, step: 0.05, hint: "quanto passa da borda esquerda" },
];

/** Só no `npm run dev`, com ?piramide na URL. */
export const PYRAMID_TUNING = import.meta.env.DEV && new URLSearchParams(window.location.search).has("piramide");

interface PyramidTunerProps {
  config: PyramidConfig;
  onChange: (config: PyramidConfig) => void;
  /** Rola a página até um momento da pirâmide (0 = troca do triângulo, 1 = fim do hero). */
  onPreview: (moment: number) => void;
}

export function PyramidTuner({ config, onChange, onPreview }: PyramidTunerProps) {
  const [moment, setMoment] = useState(0);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(KNOBS.map((k) => `${k.key}: ${config[k.key]},`).join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-lg border border-white/15 bg-black/85 p-4 font-mono text-[11px] text-white/80 backdrop-blur">
      <p className="mb-3 text-xs text-white">Ajuste da pirâmide</p>

      <label className="mb-4 block">
        <span className="flex justify-between">
          <span className="text-white">Momento</span>
          <span>{moment.toFixed(2)}</span>
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={moment}
          onChange={(e) => {
            const value = Number(e.target.value);
            setMoment(value);
            onPreview(value);
          }}
          className="w-full"
        />
        <span className="text-white/45">rola a página até esse ponto do giro</span>
      </label>

      {KNOBS.map((k) => (
        <label key={k.key} className="mb-3 block">
          <span className="flex justify-between">
            <span className="text-white">{k.label}</span>
            <span>{config[k.key]}</span>
          </span>
          <input
            type="range"
            min={k.min}
            max={k.max}
            step={k.step}
            value={config[k.key]}
            onChange={(e) => onChange({ ...config, [k.key]: Number(e.target.value) })}
            className="w-full"
          />
          <span className="text-white/45">{k.hint}</span>
        </label>
      ))}

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={copy} className="flex-1 rounded border border-white/25 px-2 py-1.5 text-white hover:bg-white/10">
          {copied ? "Copiado" : "Copiar valores"}
        </button>
        <button type="button" onClick={() => onChange(PYRAMID)} className="rounded border border-white/15 px-2 py-1.5 hover:bg-white/10">
          Voltar
        </button>
      </div>
      <p className="mt-2 text-white/45">Troque os números em src/components/portfolio/pyramid-config.ts</p>
    </div>
  );
}
