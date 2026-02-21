"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { INTEREST_OPTIONS, type ReadingLevel } from "@/types";

interface ChildDetails {
  name: string;
  age: number;
  interests: string[];
  favorite_things: string;
  fears_to_avoid: string;
  reading_level: ReadingLevel;
}

interface ChildDetailsFormProps {
  details: ChildDetails;
  onDetailsChange: (details: ChildDetails) => void;
}

export function ChildDetailsForm({
  details,
  onDetailsChange,
}: ChildDetailsFormProps) {
  const toggleInterest = (interest: string) => {
    const newInterests = details.interests.includes(interest)
      ? details.interests.filter((i) => i !== interest)
      : [...details.interests, interest];
    onDetailsChange({ ...details, interests: newInterests });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Child&apos;s Name</Label>
          <Input
            id="name"
            placeholder="e.g. Emma"
            value={details.name}
            onChange={(e) =>
              onDetailsChange({ ...details, name: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <select
            id="age"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={details.age}
            onChange={(e) =>
              onDetailsChange({ ...details, age: parseInt(e.target.value) })
            }
          >
            {[2, 3, 4, 5, 6, 7, 8].map((age) => (
              <option key={age} value={age}>
                {age} years old
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Interests (pick at least 1)</Label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => (
            <Badge
              key={interest}
              variant={
                details.interests.includes(interest) ? "default" : "outline"
              }
              className={`cursor-pointer transition-colors py-1.5 px-3 text-sm ${
                details.interests.includes(interest)
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "hover:bg-amber-50"
              }`}
              onClick={() => toggleInterest(interest)}
            >
              {interest}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="favorites">Favorite Things (optional)</Label>
        <Textarea
          id="favorites"
          placeholder="e.g. Their stuffed bear named Biscuit, the color purple, chocolate ice cream..."
          value={details.favorite_things}
          onChange={(e) =>
            onDetailsChange({ ...details, favorite_things: e.target.value })
          }
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fears">Things to Avoid (optional)</Label>
        <Textarea
          id="fears"
          placeholder="e.g. Spiders, loud noises, being alone in the dark..."
          value={details.fears_to_avoid}
          onChange={(e) =>
            onDetailsChange({ ...details, fears_to_avoid: e.target.value })
          }
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Reading Level</Label>
        <div className="flex gap-3">
          {(
            [
              { value: "beginner", label: "Beginner", desc: "Ages 2-4" },
              {
                value: "intermediate",
                label: "Intermediate",
                desc: "Ages 4-6",
              },
              { value: "advanced", label: "Advanced", desc: "Ages 6-8" },
            ] as const
          ).map((level) => (
            <button
              key={level.value}
              type="button"
              className={`flex-1 p-3 rounded-lg border-2 text-left transition-colors ${
                details.reading_level === level.value
                  ? "border-amber-500 bg-amber-50"
                  : "border-gray-200 hover:border-amber-300"
              }`}
              onClick={() =>
                onDetailsChange({ ...details, reading_level: level.value })
              }
            >
              <p className="font-medium text-sm">{level.label}</p>
              <p className="text-xs text-gray-500">{level.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
