"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DishRecord {
  id: string;
  name: string;
  description: string;
  price: number;
  packagingCharge: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  dietaryType: "VEG" | "NON_VEG";
  servesInfo: string;
  imageUrl: string;
  isAvailable: boolean;
  isSignature: boolean;
}

export interface CartItem {
  dishId: string;
  name: string;
  price: number;
  packagingCharge: number;
  imageUrl: string;
  dietaryType: "VEG" | "NON_VEG";
  servesInfo: string;
  isAvailable: boolean;
  quantity: number;
}

interface CartStoreState {
  items: CartItem[];
  cookingNotes: string;
  isCartOpen: boolean;
  activeAddressId: string | null;
  addItem: (dish: DishRecord) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  setCookingNotes: (notes: string) => void;
  setCartOpen: (open: boolean) => void;
  setActiveAddressId: (id: string | null) => void;
  clearCart: () => void;
  reconcileWithDishes: (latestDishes: DishRecord[]) => void;
  populateFromOrder: (
    orderItems: Array<{
      dishId: string | null;
      dishName: string;
      quantity: number;
    }>,
    latestDishes: DishRecord[]
  ) => { addedCount: number; unavailableNames: string[] };
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      cookingNotes: "",
      isCartOpen: false,
      activeAddressId: null,

      addItem: (dish) => {
        if (!dish.isAvailable) return;
        const current = get().items;
        const existingIndex = current.findIndex((i) => i.dishId === dish.id);

        if (existingIndex > -1) {
          const updated = [...current];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
            price: dish.price,
            packagingCharge: dish.packagingCharge,
            isAvailable: dish.isAvailable,
          };
          set({ items: updated });
        } else {
          set({
            items: [
              ...current,
              {
                dishId: dish.id,
                name: dish.name,
                price: dish.price,
                packagingCharge: dish.packagingCharge,
                imageUrl: dish.imageUrl,
                dietaryType: dish.dietaryType,
                servesInfo: dish.servesInfo,
                isAvailable: dish.isAvailable,
                quantity: 1,
              },
            ],
          });
        }
      },

      removeItem: (dishId) => {
        set({
          items: get().items.filter((i) => i.dishId !== dishId),
        });
      },

      updateQuantity: (dishId, quantity) => {
        if (quantity <= 0) {
          set({
            items: get().items.filter((i) => i.dishId !== dishId),
          });
          return;
        }
        set({
          items: get().items.map((item) =>
            item.dishId === dishId ? { ...item, quantity } : item
          ),
        });
      },

      setCookingNotes: (cookingNotes) => set({ cookingNotes }),

      setCartOpen: (isCartOpen) => set({ isCartOpen }),

      setActiveAddressId: (activeAddressId) => set({ activeAddressId }),

      clearCart: () => set({ items: [], cookingNotes: "" }),

      reconcileWithDishes: (latestDishes) => {
        if (!Array.isArray(latestDishes) || latestDishes.length === 0) return;
        const dishMap = new Map(latestDishes.map((d) => [d.id, d]));
        const current = get().items;
        if (current.length === 0) return;

        let changed = false;
        const reconciled = current.map((item) => {
          const live = dishMap.get(item.dishId);
          if (!live) {
            if (item.isAvailable !== false) changed = true;
            return { ...item, isAvailable: false };
          }
          if (
            item.name !== live.name ||
            item.price !== live.price ||
            item.packagingCharge !== live.packagingCharge ||
            item.isAvailable !== live.isAvailable ||
            item.imageUrl !== live.imageUrl ||
            item.dietaryType !== live.dietaryType
          ) {
            changed = true;
            return {
              ...item,
              name: live.name,
              price: live.price,
              packagingCharge: live.packagingCharge,
              isAvailable: live.isAvailable,
              imageUrl: live.imageUrl,
              dietaryType: live.dietaryType,
              servesInfo: live.servesInfo,
            };
          }
          return item;
        });

        if (changed) {
          set({ items: reconciled });
        }
      },

      populateFromOrder: (orderItems, latestDishes) => {
        const byId = new Map(latestDishes.map((d) => [d.id, d]));
        const byName = new Map(
          latestDishes.map((d) => [d.name.toLowerCase(), d])
        );

        const nextItems: CartItem[] = [];
        const unavailableNames: string[] = [];

        for (const oi of orderItems) {
          const dish =
            (oi.dishId ? byId.get(oi.dishId) : undefined) ||
            byName.get(oi.dishName.toLowerCase());

          if (!dish || !dish.isAvailable) {
            unavailableNames.push(oi.dishName);
            continue;
          }

          nextItems.push({
            dishId: dish.id,
            name: dish.name,
            price: dish.price,
            packagingCharge: dish.packagingCharge,
            imageUrl: dish.imageUrl,
            dietaryType: dish.dietaryType,
            servesInfo: dish.servesInfo,
            isAvailable: dish.isAvailable,
            quantity: Math.max(1, oi.quantity),
          });
        }

        if (nextItems.length > 0) {
          set({ items: nextItems, isCartOpen: true });
        }

        return {
          addedCount: nextItems.length,
          unavailableNames,
        };
      },
    }),
    {
      name: "gulmarg-royal-cart-v1",
      partialize: (state) => ({
        items: state.items,
        cookingNotes: state.cookingNotes,
        activeAddressId: state.activeAddressId,
      }),
    }
  )
);
