"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Child } from "@/types";

interface ChildSelectorProps {
  onSelectChild: (child: Child) => void;
  onCreateNew: () => void;
}

export function ChildSelector({ onSelectChild, onCreateNew }: ChildSelectorProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChildren() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("children")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const result = (data as Child[]) || [];
      setChildren(result);
      setLoading(false);

      // If no saved children, go straight to create-new
      if (result.length === 0) {
        onCreateNew();
      }
    }

    loadChildren();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <p className="text-gray-600 text-center py-8">Loading saved profiles...</p>;
  }

  if (children.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Who is this story for?
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Pick a saved child profile or create a new one.
      </p>

      <div className="grid gap-3">
        {children.map((child) => (
          <Card
            key={child.id}
            className="cursor-pointer hover:shadow-md active:shadow-sm transition-shadow"
            onClick={() => onSelectChild(child)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              {child.photo_urls[0] ? (
                <img
                  src={child.photo_urls[0]}
                  alt={child.name}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg shrink-0">
                  {child.name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{child.name}</p>
                <p className="text-sm text-gray-500">Age {child.age}</p>
                {child.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {child.interests.slice(0, 3).map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {child.interests.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{child.interests.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outline"
          className="w-full mt-1"
          onClick={onCreateNew}
        >
          + Create New Child Profile
        </Button>
      </div>
    </div>
  );
}
