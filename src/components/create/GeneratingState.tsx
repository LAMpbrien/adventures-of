"use client";

export type GenerationStep =
  | "uploading"
  | "creating"
  | "generating_story"
  | "generating_images"
  | "done";

const STEPS: { key: GenerationStep; label: string }[] = [
  { key: "uploading", label: "Uploading photos" },
  { key: "creating", label: "Creating book record" },
  { key: "generating_story", label: "Generating story with AI" },
  { key: "generating_images", label: "Generating preview illustrations" },
  { key: "done", label: "Done" },
];

interface GeneratingStateProps {
  childName: string;
  currentStep: GenerationStep;
}

export function GeneratingState({ childName, currentStep }: GeneratingStateProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="text-6xl mb-6 animate-bounce">📖</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Creating {childName}&apos;s Adventure
      </h2>

      <div className="w-full max-w-sm mt-6 space-y-3">
        {STEPS.filter((s) => s.key !== "done").map((step, i) => {
          const isActive = i === currentIndex;
          const isComplete = i < currentIndex;

          return (
            <div key={step.key} className="flex items-center gap-3 text-sm">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {isComplete ? (
                  <span className="text-green-600 font-bold">✓</span>
                ) : isActive ? (
                  <span className="inline-block w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="inline-block w-3 h-3 rounded-full bg-gray-200" />
                )}
              </div>
              <span
                className={
                  isComplete
                    ? "text-green-700"
                    : isActive
                      ? "text-amber-700 font-medium"
                      : "text-gray-400"
                }
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-sm text-gray-400 mt-6">
        This usually takes about a minute
      </p>
    </div>
  );
}
