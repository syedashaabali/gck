"use client";

import React from "react";
import { LayoutGrid, Leaf, Flame, Search, Sparkles, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";

export type DietaryFilter = "ALL" | "VEG" | "NON_VEG" | "SIGNATURE";

export interface NavCategory {
  id: string;
  name: string;
}

interface CategoryNavProps {
  categories: NavCategory[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  dietaryFilter: DietaryFilter;
  onDietaryFilter: (value: DietaryFilter) => void;
  searchQuery: string;
  onSearchQuery: (value: string) => void;
}

const tabClass =
  "rounded-none border-b-2 border-transparent bg-transparent px-2.5 py-2.5 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground shadow-none hover:text-gold-light data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-gold-light data-[state=active]:shadow-none sm:py-3.5";

export function CategoryNav({
  categories,
  selectedCategoryId,
  onSelectCategory,
  dietaryFilter,
  onDietaryFilter,
  searchQuery,
  onSearchQuery,
}: CategoryNavProps) {
  return (
    <div
      className="sticky z-30 border-y border-primary/15 bg-background/85 backdrop-blur-xl"
      style={{ top: "var(--header-h)" }}
    >
      <div className="mx-auto flex max-w-7xl flex-col px-3 sm:px-6 lg:flex-row lg:items-center lg:gap-6">
        <Tabs
          value={selectedCategoryId}
          onValueChange={onSelectCategory}
          className="min-w-0 flex-1"
        >
          <TabsList className="no-scrollbar h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-0 bg-transparent p-0 backdrop-blur-none [mask-image:linear-gradient(to_right,black_calc(100%-1.75rem),transparent)]">
            <TabsTrigger value="ALL" className={tabClass}>
              All
            </TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className={tabClass}>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 pb-2.5 pt-1 lg:py-0">
          <ToggleGroup
            type="single"
            size="sm"
            value={dietaryFilter}
            onValueChange={(v) => v && onDietaryFilter(v as DietaryFilter)}
            aria-label="Dietary filter"
            className="shrink-0 gap-0.5 rounded-xl border border-primary/15 bg-black/30 p-1"
          >
            <ToggleGroupItem
              value="ALL"
              aria-label="All dishes"
              className="h-8 px-2.5 sm:px-3"
            >
              <LayoutGrid />
              <span className="max-2xl:sr-only">All</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="VEG"
              aria-label="Pure vegetarian"
              className="h-8 px-2.5 sm:px-3"
            >
              <Leaf className="text-jade-light" />
              <span className="max-2xl:sr-only">Veg</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="NON_VEG"
              aria-label="Non-vegetarian"
              className="h-8 px-2.5 sm:px-3"
            >
              <Flame className="text-ruby-light" />
              <span className="max-2xl:sr-only">Non-Veg</span>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="SIGNATURE"
              aria-label="Chef's signature"
              className="h-8 px-2.5 sm:px-3"
            >
              <Sparkles className="text-primary" />
              <span className="max-2xl:sr-only">Signature</span>
            </ToggleGroupItem>
          </ToggleGroup>

          <div className="relative min-w-0 flex-1 lg:w-52 lg:flex-none">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground sm:left-3 sm:size-4" />
            <Input
              type="search"
              enterKeyHint="search"
              aria-label="Search the menu"
              placeholder="Search dishes…"
              value={searchQuery}
              onChange={(e) => onSearchQuery(e.target.value)}
              className="h-9 pl-8 pr-7 text-xs sm:pl-9 sm:pr-8 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
