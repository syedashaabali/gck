"use client";

import React, { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { AlertOctagon, ArrowRight, ShoppingBag, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  LuxuryHeader,
  type AuthenticatedUser,
  type AddressItem,
} from "@/components/storefront/LuxuryHeader";
import { HeroSection } from "@/components/storefront/HeroSection";
import {
  CategoryNav,
  type DietaryFilter,
} from "@/components/storefront/CategoryNav";
import { SiteFooter } from "@/components/storefront/SiteFooter";
import { AuthDialog } from "@/components/storefront/AuthDialog";
import { OnboardingDialog } from "@/components/storefront/OnboardingDialog";
import { AddressBookSheet } from "@/components/storefront/AddressBookSheet";
import { DishCard } from "@/components/storefront/DishCard";
import {
  CartSheet,
  type StoreSettingsRecord,
} from "@/components/storefront/CartSheet";
import { Ornament } from "@/components/brand/Brand";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCartStore, type DishRecord } from "@/store/useCartStore";
import { formatINR } from "@/lib/utils";

interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

interface MenuResponse {
  settings: StoreSettingsRecord;
  categories: CategoryRecord[];
  dishes: DishRecord[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const DEFAULT_SETTINGS: StoreSettingsRecord = {
  id: "default",
  storeName: "Gulmarg Cloud Kitchen",
  isAcceptingOrders: true,
  deliveryFee: 40,
  freeDeliveryThreshold: 499,
  minOrderAmount: 149,
  taxPercentage: 5,
  whatsappNumber: "+919876543210",
  fssaiNumber: "22726199000490",
  serviceablePincodes: "ALL",
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8 text-center md:mb-10">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-3 max-w-xl font-script text-lg italic text-muted-foreground md:text-xl">
          {subtitle}
        </p>
      )}
      <Ornament className="mt-5" />
    </div>
  );
}

export default function CustomerStorefrontPage() {
  // Poll PostgreSQL menu & settings every 4 seconds for real-time stock & kitchen status sync
  const {
    data: menuData,
    isLoading: menuLoading,
    mutate: mutateMenu,
  } = useSWR<MenuResponse>("/api/dishes", fetcher, {
    refreshInterval: 4000,
    revalidateOnFocus: true,
  });

  const { data: authData, mutate: mutateAuth } = useSWR<{
    user: AuthenticatedUser | null;
  }>("/api/auth/me", fetcher);

  const {
    items,
    isCartOpen,
    activeAddressId,
    addItem,
    updateQuantity,
    setCartOpen,
    setActiveAddressId,
    reconcileWithDishes,
  } = useCartStore();

  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [addressBookOpen, setAddressBookOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("ALL");
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const user = authData?.user || null;
  const settings = menuData?.settings || DEFAULT_SETTINGS;
  const categories = useMemo(
    () => menuData?.categories || [],
    [menuData?.categories]
  );
  const dishes = useMemo(() => menuData?.dishes || [], [menuData?.dishes]);

  // Reconcile cart whenever dishes refresh from PostgreSQL
  useEffect(() => {
    if (dishes.length > 0) {
      reconcileWithDishes(dishes);
    }
  }, [dishes, reconcileWithDishes]);

  // Active delivery address resolution
  const activeAddress: AddressItem | null = useMemo(() => {
    if (!user || !user.addresses || user.addresses.length === 0) return null;
    if (activeAddressId) {
      const found = user.addresses.find((a) => a.id === activeAddressId);
      if (found) return found;
    }
    return user.addresses.find((a) => a.isDefault) || user.addresses[0];
  }, [user, activeAddressId]);

  const cartQuantityMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.dishId, item.quantity);
    }
    return map;
  }, [items]);

  const totalCartItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal =
    Math.round(
      items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100
    ) / 100;

  const filtersActive =
    selectedCategoryId !== "ALL" ||
    dietaryFilter !== "ALL" ||
    searchQuery.trim() !== "";

  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      if (
        selectedCategoryId !== "ALL" &&
        dish.categoryId !== selectedCategoryId
      ) {
        return false;
      }
      if (dietaryFilter === "VEG" && dish.dietaryType !== "VEG") return false;
      if (dietaryFilter === "NON_VEG" && dish.dietaryType !== "NON_VEG") {
        return false;
      }
      if (dietaryFilter === "SIGNATURE" && !dish.isSignature) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          dish.name.toLowerCase().includes(q) ||
          dish.description.toLowerCase().includes(q) ||
          dish.category?.name?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [dishes, selectedCategoryId, dietaryFilter, searchQuery]);

  const signatureDishes = useMemo(
    () => dishes.filter((d) => d.isSignature),
    [dishes]
  );

  const navCategories = useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        name: c.name,
      })),
    [categories]
  );

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    mutateAuth({ user: null }, false);
    toast.success("Signed out of Gulmarg Cloud Kitchen.");
  };

  const handleSeedFromEmptyState = async () => {
    const res = await fetch("/api/seed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ force: true }),
    });
    if (res.ok) {
      toast.success("Royal Gulmarg Menu seeded!");
      mutateMenu();
    }
  };

  const handleAdd = (d: DishRecord) => {
    addItem(d);
    toast.dismiss();
    toast.success(`${d.name} added to your cart`, {
      duration: 1800,
    });
  };

  const resetFilters = () => {
    setSelectedCategoryId("ALL");
    setDietaryFilter("ALL");
    setSearchQuery("");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <LuxuryHeader
        storeName={settings.storeName}
        user={user}
        activeAddress={activeAddress}
        cartCount={totalCartItems}
        cartSubtotal={cartSubtotal}
        isKitchenOpen={settings.isAcceptingOrders}
        freeDeliveryThreshold={settings.freeDeliveryThreshold}
        onOpenAuth={() => setAuthDialogOpen(true)}
        onOpenAddressBook={() => {
          if (!user) setAuthDialogOpen(true);
          else setAddressBookOpen(true);
        }}
        onOpenCart={() => setCartOpen(true)}
        onLogout={handleLogout}
      />

      {!settings.isAcceptingOrders && (
        <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6">
          <Alert className="border-ruby-light/40 bg-ruby/15 text-foreground">
            <AlertOctagon className="size-4 !text-ruby-light" />
            <AlertTitle className="font-serif text-base">
              The kitchen is resting
            </AlertTitle>
            <AlertDescription className="text-foreground/75">
              {settings.storeName} is not accepting new orders right now. You
              are welcome to browse the menu while our chefs prepare for the
              next service.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <HeroSection
        freeDeliveryThreshold={settings.freeDeliveryThreshold}
        minOrderAmount={settings.minOrderAmount}
        fssaiNumber={settings.fssaiNumber}
      />

      <main className="flex-1">
        {/* Chef's Signatures */}
        {!menuLoading && !filtersActive && signatureDishes.length > 0 && (
          <section
            id="signatures"
            className="mx-auto max-w-7xl px-4 pb-6 pt-4 sm:px-6 md:pt-8"
          >
            <SectionHeading
              eyebrow="The Chef's Selection"
              title="Signature Collection"
              subtitle="The dishes our Wazas are most proud of"
            />
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 sm:-mx-6 sm:px-6">
              {signatureDishes.map((dish, idx) => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  variant="feature"
                  priority={idx < 2}
                  quantityInCart={cartQuantityMap.get(dish.id) || 0}
                  isKitchenOpen={settings.isAcceptingOrders}
                  onAdd={handleAdd}
                  onUpdateQuantity={updateQuantity}
                />
              ))}
            </div>
          </section>
        )}

        {/* The Menu */}
        <section id="menu" className="pt-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="À la carte"
              title="The Royal Menu"
              subtitle="Prepared fresh, sealed on dum, delivered warm"
            />
          </div>

          <CategoryNav
            categories={navCategories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            dietaryFilter={dietaryFilter}
            onDietaryFilter={setDietaryFilter}
            searchQuery={searchQuery}
            onSearchQuery={setSearchQuery}
          />

          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            {menuLoading ? (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-40 w-full rounded-2xl sm:h-48" />
                ))}
              </div>
            ) : dishes.length === 0 ? (
              <div className="glass mx-auto max-w-lg rounded-2xl p-10 text-center">
                <Sparkles className="mx-auto size-10 text-primary" />
                <h3 className="mt-4 font-serif text-2xl font-semibold">
                  The menu awaits its first service
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  No dishes are loaded in PostgreSQL yet. Seed the authentic
                  10-dish Kashmiri Wazwan menu to begin.
                </p>
                <Button onClick={handleSeedFromEmptyState} className="mt-6">
                  Seed Royal Gulmarg Menu
                </Button>
              </div>
            ) : filteredDishes.length === 0 ? (
              <div className="glass mx-auto max-w-lg rounded-2xl p-10 text-center">
                <h3 className="font-serif text-2xl font-semibold">
                  No dishes match your search
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try clearing the dietary filter or search to see the full
                  menu.
                </p>
                <Button variant="outline" onClick={resetFilters} className="mt-6">
                  Reset filters
                </Button>
              </div>
            ) : !filtersActive ? (
              <div className="space-y-16">
                {categories.map((category, idx) => {
                  const catDishes = filteredDishes.filter(
                    (d) => d.categoryId === category.id
                  );
                  if (catDishes.length === 0) return null;
                  return (
                    <section key={category.id} aria-labelledby={`cat-${category.id}`}>
                      <div className="mb-6 text-center">
                        <p className="eyebrow">Course {ROMAN[idx] ?? idx + 1}</p>
                        <h3
                          id={`cat-${category.id}`}
                          className="mt-2 font-serif text-2xl font-semibold md:text-4xl"
                        >
                          {category.name}
                        </h3>
                        <Ornament className="mt-4" lineClassName="w-10 md:w-16" />
                      </div>
                      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                        {catDishes.map((dish) => (
                          <div key={dish.id} className="reveal">
                            <DishCard
                              dish={dish}
                              quantityInCart={cartQuantityMap.get(dish.id) || 0}
                              isKitchenOpen={settings.isAcceptingOrders}
                              onAdd={handleAdd}
                              onUpdateQuantity={updateQuantity}
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            ) : (
              <>
                <p className="mb-5 text-sm text-muted-foreground">
                  Showing{" "}
                  <strong className="text-gold-light">
                    {filteredDishes.length}
                  </strong>{" "}
                  {filteredDishes.length === 1 ? "dish" : "dishes"}
                </p>
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {filteredDishes.map((dish) => (
                    <DishCard
                      key={dish.id}
                      dish={dish}
                      quantityInCart={cartQuantityMap.get(dish.id) || 0}
                      isKitchenOpen={settings.isAcceptingOrders}
                      onAdd={handleAdd}
                      onUpdateQuantity={updateQuantity}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <SiteFooter
        storeName={settings.storeName}
        fssaiNumber={settings.fssaiNumber}
        whatsappNumber={settings.whatsappNumber}
      />

      {/* Floating mobile cart bar */}
      {totalCartItems > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-background via-background/90 to-transparent p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex w-full items-center justify-between rounded-2xl bg-gold-gradient px-5 py-3.5 text-primary-foreground shadow-gold-lg"
          >
            <span className="flex items-center gap-2.5">
              <ShoppingBag className="size-5" />
              <span className="text-sm font-extrabold">
                {totalCartItems} {totalCartItems === 1 ? "item" : "items"} ·{" "}
                {formatINR(cartSubtotal)}
              </span>
            </span>
            <span className="flex items-center gap-1 text-sm font-bold">
              View cart <ArrowRight className="size-4" />
            </span>
          </button>
        </div>
      )}

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        onSuccess={(loggedInUser) => {
          mutateAuth({ user: loggedInUser }, false);
        }}
      />

      <OnboardingDialog
        open={Boolean(user && !user.isOnboarded)}
        user={user}
        onComplete={(updatedUser) => {
          mutateAuth({ user: updatedUser }, false);
          if (updatedUser.addresses?.[0]) {
            setActiveAddressId(updatedUser.addresses[0].id);
          }
        }}
      />

      <AddressBookSheet
        open={addressBookOpen}
        onOpenChange={setAddressBookOpen}
        addresses={user?.addresses || []}
        activeAddressId={activeAddress?.id || null}
        onAddressesUpdated={(updatedAddresses, selectedId) => {
          if (user) {
            mutateAuth(
              { user: { ...user, addresses: updatedAddresses } },
              false
            );
          }
          if (selectedId) setActiveAddressId(selectedId);
        }}
      />

      <CartSheet
        open={isCartOpen}
        onOpenChange={setCartOpen}
        dishes={dishes}
        settings={settings}
        user={user}
        activeAddress={activeAddress}
        onRequireAuth={() => setAuthDialogOpen(true)}
        onOpenAddressBook={() => setAddressBookOpen(true)}
      />
    </div>
  );
}
