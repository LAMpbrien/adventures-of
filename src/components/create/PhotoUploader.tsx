"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface PhotoUploaderProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
}

export function PhotoUploader({ photos, onPhotosChange }: PhotoUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      const totalFiles = [...photos, ...newFiles].slice(0, 10);
      onPhotosChange(totalFiles);

      // Generate previews
      const newPreviews = totalFiles.map((file) => URL.createObjectURL(file));
      previews.forEach((p) => URL.revokeObjectURL(p));
      setPreviews(newPreviews);
    },
    [photos, onPhotosChange, previews]
  );

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
    setPreviews(newPreviews);
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragActive
            ? "border-amber-500 bg-amber-50"
            : "border-gray-300 hover:border-amber-400"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-4xl mb-2">📸</div>
        <p className="text-gray-600 font-medium">
          Tap to take a photo or choose from library
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Upload up to 10 clear photos of your child (face visible)
        </p>
      </div>

      {previews.length > 0 && (
        <div className="flex gap-3">
          {previews.map((src, i) => (
            <div key={i} className="relative group">
              <img
                src={src}
                alt={`Photo ${i + 1}`}
                className="w-24 h-24 object-cover rounded-lg border"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 w-7 h-7 p-0 rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(i);
                }}
              >
                &times;
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="text-sm text-gray-500">
        {photos.length}/10 photos uploaded
        {photos.length < 2 && " (minimum 2 required)"}
      </p>
    </div>
  );
}
