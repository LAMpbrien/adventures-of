"use client";

import { getThemesForRegion, ILLUSTRATION_STYLES, type Theme, type Region, type ImageQuality, type IllustrationStyle } from "@/types";

interface ThemePickerProps {
  selectedTheme: Theme | null;
  onThemeSelect: (theme: Theme) => void;
  region: Region;
  onRegionChange: (region: Region) => void;
  imageQuality: ImageQuality;
  onImageQualityChange: (quality: ImageQuality) => void;
  illustrationStyle: IllustrationStyle;
  onIllustrationStyleChange: (style: IllustrationStyle) => void;
}

const REGIONS: { id: Region; label: string; flag: string }[] = [
  { id: "global", label: "Global", flag: "🌍" },
  { id: "au", label: "Australia", flag: "🇦🇺" },
  { id: "nz", label: "New Zealand", flag: "🇳🇿" },
];

const QUALITY_OPTIONS: { id: ImageQuality; label: string; description: string }[] = [
  { id: "fast", label: "Fast", description: "Quicker generation, great quality" },
  { id: "standard", label: "Best", description: "Highest quality, takes longer" },
];

export function ThemePicker({ selectedTheme, onThemeSelect, region, onRegionChange, imageQuality, onImageQualityChange, illustrationStyle, onIllustrationStyleChange }: ThemePickerProps) {
  const themes = getThemesForRegion(region);
  const globalThemes = themes.filter((t) => t.region === "global");
  const localThemes = themes.filter((t) => t.region !== "global");

  const handleRegionChange = (newRegion: Region) => {
    onRegionChange(newRegion);
    // Clear theme selection when region changes since the selected theme may not be available
    onThemeSelect(null as unknown as Theme);
  };

  return (
    <div className="space-y-6">
      {/* Region selector */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Your Region
        </h3>
        <div className="flex gap-2">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`px-4 py-2 min-h-11 rounded-lg border-2 text-sm font-medium transition-all ${
                region === r.id
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : "border-gray-200 text-gray-600 hover:border-amber-300"
              }`}
              onClick={() => handleRegionChange(r.id)}
            >
              {r.flag} {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Local themes */}
      {localThemes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            {region === "au" ? "Australian Adventures" : "New Zealand Adventures"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {localThemes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                className={`p-6 rounded-xl border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  selectedTheme === theme.id
                    ? "border-amber-500 bg-amber-50 shadow-md"
                    : "border-gray-200 hover:border-amber-300"
                }`}
                onClick={() => onThemeSelect(theme.id)}
              >
                <div className="text-4xl mb-3">{theme.emoji}</div>
                <h3 className="text-lg font-semibold text-gray-900">{theme.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Global themes */}
      <div>
        {localThemes.length > 0 && (
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            Classic Adventures
          </h3>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {globalThemes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`p-6 rounded-xl border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                selectedTheme === theme.id
                  ? "border-amber-500 bg-amber-50 shadow-md"
                  : "border-gray-200 hover:border-amber-300"
              }`}
              onClick={() => onThemeSelect(theme.id)}
            >
              <div className="text-4xl mb-3">{theme.emoji}</div>
              <h3 className="text-lg font-semibold text-gray-900">{theme.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Illustration style */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Illustration Style
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {ILLUSTRATION_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              className={`px-4 py-3 min-h-11 rounded-lg border-2 text-left transition-all ${
                illustrationStyle === style.id
                  ? "border-amber-500 bg-amber-50"
                  : "border-gray-200 hover:border-amber-300"
              }`}
              onClick={() => onIllustrationStyleChange(style.id)}
            >
              <span className="font-medium text-gray-900">{style.name}</span>
              <p className="text-xs text-gray-500 mt-0.5">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Image quality */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
          Illustration Quality
        </h3>
        <div className="flex gap-3">
          {QUALITY_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`flex-1 px-4 py-3 min-h-11 rounded-lg border-2 text-left transition-all ${
                imageQuality === opt.id
                  ? "border-amber-500 bg-amber-50"
                  : "border-gray-200 hover:border-amber-300"
              }`}
              onClick={() => onImageQualityChange(opt.id)}
            >
              <span className="font-medium text-gray-900">{opt.label}</span>
              <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
