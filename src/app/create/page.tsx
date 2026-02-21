"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PhotoUploader } from "@/components/create/PhotoUploader";
import { ChildDetailsForm } from "@/components/create/ChildDetailsForm";
import { ThemePicker } from "@/components/create/ThemePicker";
import { ChildSelector } from "@/components/create/ChildSelector";
import { GeneratingState, type GenerationStep } from "@/components/create/GeneratingState";
import type { Theme, ReadingLevel, Region, Child, ImageQuality, IllustrationStyle } from "@/types";
import { THEMES } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { getUserMessage } from "@/lib/errors";

const NEW_CHILD_STEPS = ["Upload Photos", "Child Details", "Pick a Theme"];
const EXISTING_CHILD_STEPS = ["Pick a Theme"];

interface ChildDetails {
  name: string;
  age: number;
  interests: string[];
  favorite_things: string;
  fears_to_avoid: string;
  reading_level: ReadingLevel;
}

function CreateFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childIdParam = searchParams.get("child_id");

  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<GenerationStep>("uploading");
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Child selection state
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [isNewChild, setIsNewChild] = useState(false);

  // New child form state
  const [photos, setPhotos] = useState<File[]>([]);
  const [details, setDetails] = useState<ChildDetails>({
    name: "",
    age: 5,
    interests: [],
    favorite_things: "",
    fears_to_avoid: "",
    reading_level: "intermediate",
  });
  const [theme, setTheme] = useState<Theme | null>(null);
  const [region, setRegion] = useState<Region>("global");
  const [imageQuality, setImageQuality] = useState<ImageQuality>("fast");
  const [illustrationStyle, setIllustrationStyle] = useState<IllustrationStyle>("watercolor");

  // Deep-link: auto-select child from ?child_id param
  useEffect(() => {
    if (!childIdParam) return;

    async function loadChild() {
      const supabase = createClient();
      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("id", childIdParam)
        .single();

      if (data) {
        setSelectedChild(data as Child);
        setIsNewChild(false);
        setStep(3); // Jump to theme picker
      }
    }

    loadChild();
  }, [childIdParam]);

  const steps = isNewChild ? NEW_CHILD_STEPS : EXISTING_CHILD_STEPS;

  // Map internal step number to display step index (step 0 is the branching chooser, not shown in progress)
  const displayStep = (() => {
    if (isNewChild) return step - 1; // step 1=0, step 2=1, step 3=2
    return 0; // existing child: theme is the only step
  })();

  const canProceed = () => {
    if (step === 0) return false; // Handled by ChildSelector callbacks
    if (step === 1) return photos.length >= 2;
    if (step === 2)
      return details.name.trim() !== "" && details.interests.length > 0;
    if (step === 3) return theme !== null;
    return false;
  };

  const handleSelectChild = (child: Child) => {
    setSelectedChild(child);
    setIsNewChild(false);
    setStep(3);
  };

  const handleCreateNew = () => {
    setSelectedChild(null);
    setIsNewChild(true);
    setStep(1);
  };

  const handleBack = () => {
    if (isNewChild) {
      if (step === 1) {
        // Go back to child selector
        setIsNewChild(false);
        setStep(0);
      } else {
        setStep((s) => s - 1);
      }
    } else {
      // Existing child: only step 3 (theme) can go back to step 0
      setStep(0);
      setSelectedChild(null);
    }
  };

  // Derive region from selected theme
  const selectedRegion = theme
    ? THEMES.find((t) => t.id === theme)?.region ?? "global"
    : region;

  // Poll book status until generation completes or fails
  const pollStatus = (bookId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/book/${bookId}/status`);
        if (!res.ok) return; // Transient error, keep polling

        const { status } = await res.json();

        if (status === "generating_story") {
          setGenerationStep("generating_story");
        } else if (status === "generating_images") {
          setGenerationStep("generating_images");
        } else if (status === "preview_ready") {
          clearInterval(interval);
          pollIntervalRef.current = null;
          setGenerationStep("done");
          router.push(`/preview/${bookId}`);
        } else if (status === "failed") {
          clearInterval(interval);
          pollIntervalRef.current = null;
          setError("Generation failed. Please try again.");
          setGenerating(false);
        }
      } catch {
        // Network error (e.g. phone waking up) — keep polling
      }
    }, 3000);

    pollIntervalRef.current = interval;
  };

  const handleSubmit = async () => {
    if (!theme) return;
    setGenerating(true);
    setGenerationStep("uploading");
    setError(null);

    try {
      const supabase = createClient();

      // Upload photos for new child (storage uploads work fine client-side)
      let photoUrls: string[] | undefined;
      if (!selectedChild) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated. Please log in and try again.");

        photoUrls = [];
        for (const photo of photos) {
          const fileName = `${user.id}/${Date.now()}-${photo.name}`;
          const { data, error: uploadError } = await supabase.storage
            .from("photos")
            .upload(fileName, photo);
          if (uploadError) throw new Error(`Failed to upload photo "${photo.name}": ${uploadError.message}`);

          const {
            data: { publicUrl },
          } = supabase.storage.from("photos").getPublicUrl(data.path);
          photoUrls.push(publicUrl);
        }
      }

      // Create child (if new) and book via API route
      setGenerationStep("creating");
      const createResponse = await fetch("/api/create-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          child_id: selectedChild?.id,
          child_details: selectedChild
            ? undefined
            : {
                name: details.name,
                age: details.age,
                interests: details.interests,
                favorite_things: details.favorite_things || null,
                fears_to_avoid: details.fears_to_avoid || null,
                reading_level: details.reading_level,
                photo_urls: photoUrls,
              },
          theme,
          region: selectedRegion,
          image_quality: imageQuality,
          illustration_style: illustrationStyle,
        }),
      });

      if (!createResponse.ok) {
        const errData = await createResponse.json();
        throw new Error(errData.error || `Create book failed (${createResponse.status})`);
      }

      const { book_id, child_id } = await createResponse.json();

      // Fire off server-side generation (don't await — server runs independently)
      setGenerationStep("generating_story");
      fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ child_id, book_id, theme, region: selectedRegion }),
      }).catch(() => {
        // Connection may drop (e.g. phone lock) — that's fine,
        // the server keeps running and we poll for status
      });

      // Poll for status updates instead of waiting on the fetch response
      pollStatus(book_id);
    } catch (err) {
      console.error("Creation error:", err);
      setError(getUserMessage(err));
      setGenerating(false);
    }
  };

  const childName = selectedChild?.name || details.name;

  if (generating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-6">
        <GeneratingState childName={childName} currentStep={generationStep} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="mx-auto max-w-2xl md:max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Your Story
          </h1>
          {step > 0 && (
            <p className="text-gray-600 mt-2">
              Step {displayStep + 1} of {steps.length}: {steps[displayStep]}
            </p>
          )}
        </div>

        {/* Progress (hidden on initial child selection screen) */}
        {step > 0 && (
          <div className="flex gap-2 mb-8">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= displayStep ? "bg-amber-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* Step content */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          {step === 0 && (
            <ChildSelector
              onSelectChild={handleSelectChild}
              onCreateNew={handleCreateNew}
            />
          )}
          {step === 1 && (
            <PhotoUploader photos={photos} onPhotosChange={setPhotos} />
          )}
          {step === 2 && (
            <ChildDetailsForm
              details={details}
              onDetailsChange={setDetails}
            />
          )}
          {step === 3 && (
            <ThemePicker selectedTheme={theme} onThemeSelect={setTheme} region={region} onRegionChange={setRegion} imageQuality={imageQuality} onImageQualityChange={setImageQuality} illustrationStyle={illustrationStyle} onIllustrationStyleChange={setIllustrationStyle} />
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Navigation (hidden on step 0 since ChildSelector has its own actions) */}
        {step > 0 && (
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            {step < 3 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800"
              >
                Create My Story
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense>
      <CreateFlow />
    </Suspense>
  );
}
