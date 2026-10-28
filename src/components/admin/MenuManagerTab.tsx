"use client";

import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Sparkles,
  FolderPlus,
  ArrowUp,
  ArrowDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatINR } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DishRecord } from "@/store/useCartStore";

export interface CategoryAdminRecord {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

interface MenuManagerTabProps {
  categories: CategoryAdminRecord[];
  dishes: DishRecord[];
  onRefresh: () => void;
}

export function MenuManagerTab({
  categories,
  dishes,
  onRefresh,
}: MenuManagerTabProps) {
  // Category form state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [catBusy, setCatBusy] = useState(false);

  // Dish modal state
  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<DishRecord | null>(null);
  const [dishName, setDishName] = useState("");
  const [dishDesc, setDishDesc] = useState("");
  const [dishCategoryId, setDishCategoryId] = useState("");
  const [dishPrice, setDishPrice] = useState("");
  const [dishPackaging, setDishPackaging] = useState("15");
  const [dishDietary, setDishDietary] = useState<"VEG" | "NON_VEG">("NON_VEG");
  const [dishServes, setDishServes] = useState("Serves 1-2");
  const [dishImageUrl, setDishImageUrl] = useState("");
  const [dishSignature, setDishSignature] = useState(false);
  const [dishAvailable, setDishAvailable] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingDish, setSavingDish] = useState(false);

  const openAddDishModal = () => {
    setEditingDish(null);
    setDishName("");
    setDishDesc("");
    setDishCategoryId(categories[0]?.id || "");
    setDishPrice("");
    setDishPackaging("20");
    setDishDietary("NON_VEG");
    setDishServes("Serves 1-2");
    setDishImageUrl("");
    setDishSignature(false);
    setDishAvailable(true);
    setDishModalOpen(true);
  };

  const openEditDishModal = (dish: DishRecord) => {
    setEditingDish(dish);
    setDishName(dish.name);
    setDishDesc(dish.description);
    setDishCategoryId(dish.categoryId);
    setDishPrice(String(dish.price));
    setDishPackaging(String(dish.packagingCharge));
    setDishDietary(dish.dietaryType);
    setDishServes(dish.servesInfo);
    setDishImageUrl(dish.imageUrl);
    setDishSignature(dish.isSignature);
    setDishAvailable(dish.isAvailable);
    setDishModalOpen(true);
  };

  // Category CRUD Handlers
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCatBusy(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          sortOrder: categories.length + 1,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to add category");
        return;
      }
      setNewCategoryName("");
      toast.success("Category created in PostgreSQL!");
      onRefresh();
    } finally {
      setCatBusy(false);
    }
  };

  const handleUpdateCategory = async (
    id: string,
    payload: Partial<CategoryAdminRecord>
  ) => {
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setEditingCategoryId(null);
      toast.success("Category updated.");
      onRefresh();
    } else {
      toast.error("Failed to update category.");
    }
  };

  const handleDeleteCategory = async (cat: CategoryAdminRecord) => {
    if (
      !window.confirm(
        `Delete category "${cat.name}" and all its associated dishes?`
      )
    ) {
      return;
    }
    const res = await fetch(`/api/categories/${cat.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success(`Category "${cat.name}" deleted.`);
      onRefresh();
    } else {
      toast.error("Failed to delete category.");
    }
  };

  // Image File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        return;
      }
      setDishImageUrl(data.url);
      toast.success("Dish photo uploaded to /public/uploads/!");
    } catch {
      toast.error("Error uploading file.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Dish (Add or Edit)
  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dishName.trim() || !dishDesc.trim() || !dishCategoryId) {
      toast.error("Please fill all required dish fields.");
      return;
    }

    setSavingDish(true);
    try {
      const payload = {
        name: dishName.trim(),
        description: dishDesc.trim(),
        categoryId: dishCategoryId,
        price: Number(dishPrice),
        packagingCharge: Number(dishPackaging),
        dietaryType: dishDietary,
        servesInfo: dishServes.trim() || "Serves 1-2",
        imageUrl:
          dishImageUrl.trim() ||
          "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80",
        isSignature: dishSignature,
        isAvailable: dishAvailable,
      };

      const url = editingDish
        ? `/api/dishes/${editingDish.id}`
        : "/api/dishes";
      const method = editingDish ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to save dish.");
        return;
      }

      toast.success(
        editingDish
          ? `"${dishName}" updated in PostgreSQL!`
          : `"${dishName}" added to the Royal Menu!`
      );
      setDishModalOpen(false);
      onRefresh();
    } finally {
      setSavingDish(false);
    }
  };

  // Instant Out-of-Stock / Signature Toggle
  const handleToggleDishField = async (
    dish: DishRecord,
    field: "isAvailable" | "isSignature",
    value: boolean
  ) => {
    const res = await fetch(`/api/dishes/${dish.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    if (res.ok) {
      toast.success(
        field === "isAvailable"
          ? `${dish.name} marked ${value ? "In Stock" : "Out of Stock"}`
          : `${dish.name} Chef's Signature ${value ? "enabled" : "disabled"}`
      );
      onRefresh();
    } else {
      toast.error("Failed to update dish.");
    }
  };

  const handleDeleteDish = async (dish: DishRecord) => {
    if (!window.confirm(`Delete "${dish.name}" from the menu permanently?`)) {
      return;
    }
    const res = await fetch(`/api/dishes/${dish.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success(`"${dish.name}" deleted.`);
      onRefresh();
    } else {
      toast.error("Failed to delete dish.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Category Manager */}
      <div className="space-y-4 rounded-2xl border border-primary/25 bg-card p-4 shadow-lg sm:p-5">
        <div className="flex flex-col justify-between gap-3 border-b border-primary/15 pb-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground">
              Royal Category Manager
            </h3>
            <p className="text-xs text-muted-foreground">
              Add, rename, reorder sort priority, or toggle active visibility on
              the customer storefront.
            </p>
          </div>

          <form
            onSubmit={handleAddCategory}
            className="flex w-full items-center gap-2 sm:w-auto"
          >
            <Input
              placeholder="New category name..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="h-9 min-w-0 flex-1 text-xs sm:w-52 sm:flex-none"
            />
            <Button
              type="submit"
              size="sm"
              disabled={catBusy || !newCategoryName.trim()}
              className="h-9 shrink-0 gap-1.5"
            >
              <FolderPlus className="h-4 w-4" />
              <span>Add Category</span>
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {categories.map((cat, idx) => (
            <div
              key={cat.id}
              className="flex flex-col gap-3 rounded-xl border border-primary/20 bg-background/70 p-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-card font-mono text-xs text-primary">
                  {cat.sortOrder}
                </span>

                {editingCategoryId === cat.id ? (
                  <div className="flex flex-1 items-center gap-1.5">
                    <Input
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        handleUpdateCategory(cat.id, {
                          name: editingCategoryName,
                        })
                      }
                      className="h-8 px-2.5 text-xs"
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="min-w-0">
                    <p className="truncate font-serif text-sm font-bold text-foreground">
                      {cat.name}
                    </p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      /{cat.slug}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-primary/10 pt-2.5 sm:shrink-0 sm:justify-end sm:border-t-0 sm:pt-0">
                <div className="flex items-center gap-1.5 pr-1">
                  <span className="text-[10px] uppercase text-muted-foreground">
                    {cat.isActive ? "Active" : "Hidden"}
                  </span>
                  <Switch
                    checked={cat.isActive}
                    onCheckedChange={(checked) =>
                      handleUpdateCategory(cat.id, { isActive: checked })
                    }
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() =>
                      handleUpdateCategory(cat.id, {
                        sortOrder: Math.max(1, cat.sortOrder - 1),
                      })
                    }
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
                    title="Move Up"
                    aria-label={`Move ${cat.name} up`}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateCategory(cat.id, {
                        sortOrder: cat.sortOrder + 1,
                      })
                    }
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                    title="Move Down"
                    aria-label={`Move ${cat.name} down`}
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategoryId(cat.id);
                      setEditingCategoryName(cat.name);
                    }}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-primary"
                    title="Rename Category"
                    aria-label={`Rename ${cat.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat)}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-red-950/60 hover:text-red-400"
                    title="Delete Category"
                    aria-label={`Delete ${cat.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Live Dish Inventory Table */}
      <div className="space-y-4 rounded-2xl border border-primary/25 bg-card p-4 shadow-lg sm:p-5">
        <div className="flex flex-col justify-between gap-3 border-b border-primary/15 pb-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground">
              Live Dish Inventory & Stock Controls ({dishes.length})
            </h3>
            <p className="text-xs text-muted-foreground">
              Toggle the In-Stock switch to immediately dim unavailable dishes
              and block checkout on the customer storefront.
            </p>
          </div>

          <Button onClick={openAddDishModal} className="w-full gap-1.5 sm:w-auto">
            <Plus className="h-4 w-4" />
            <span>Add New Royal Dish</span>
          </Button>
        </div>

        {/* Modern Web Guidance: responsive-table */}
        <div className="responsive-table-wrapper luxury-scroller">
          <Table className="responsive-table text-left text-xs">
            <TableHeader>
              <TableRow className="border-b border-primary/20 bg-secondary text-[11px] font-semibold uppercase tracking-wider text-primary">
                <TableHead className="p-3">Dish</TableHead>
                <TableHead className="p-3">Category</TableHead>
                <TableHead className="p-3">Dietary</TableHead>
                <TableHead className="p-3">Price</TableHead>
                <TableHead className="p-3">Packaging</TableHead>
                <TableHead className="p-3">In Stock</TableHead>
                <TableHead className="p-3">Signature</TableHead>
                <TableHead className="p-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dishes.map((dish) => (
                <TableRow
                  key={dish.id}
                  className="transition hover:bg-secondary/50"
                >
                  <TableHead scope="row" className="h-auto p-3.5 font-normal">
                    <div className="flex items-center gap-3">
                      <img
                        src={dish.imageUrl}
                        alt={dish.name}
                        className="h-11 w-11 shrink-0 rounded-lg object-cover border border-primary/25"
                      />
                      <div>
                        <p className="font-serif text-sm font-bold text-foreground">
                          {dish.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {dish.servesInfo}
                        </p>
                      </div>
                    </div>
                  </TableHead>
                  <TableCell className="p-3 text-foreground/90">
                    {dish.category?.name || "—"}
                  </TableCell>
                  <TableCell className="p-3">
                    <Badge
                      variant={
                        dish.dietaryType === "VEG" ? "success" : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {dish.dietaryType === "VEG" ? "Pure Veg" : "Non-Veg"}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-3 font-mono font-bold text-primary">
                    {formatINR(dish.price)}
                  </TableCell>
                  <TableCell className="p-3 font-mono text-muted-foreground">
                    {formatINR(dish.packagingCharge)}
                  </TableCell>
                  <TableCell className="p-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={dish.isAvailable}
                        onCheckedChange={(checked) =>
                          handleToggleDishField(dish, "isAvailable", checked)
                        }
                      />
                      <span
                        className={`text-[11px] font-semibold ${
                          dish.isAvailable ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {dish.isAvailable ? "Available" : "Sold Out"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="p-3">
                    <Switch
                      checked={dish.isSignature}
                      onCheckedChange={(checked) =>
                        handleToggleDishField(dish, "isSignature", checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="p-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDishModal(dish)}
                        className="h-8 px-2.5"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteDish(dish)}
                        className="h-8 px-2.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Add / Edit Dish Modal */}
      <Dialog open={dishModalOpen} onOpenChange={setDishModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingDish
                ? `Edit Dish: ${editingDish.name}`
                : "Add New Royal Delicacy"}
            </DialogTitle>
            <DialogDescription>
              All dish details and images are persisted directly to PostgreSQL.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDish} className="space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="dish-name">Dish Name *</Label>
              <Input
                id="dish-name"
                required
                placeholder="e.g., Kashmiri Rogan Josh"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="dish-desc">Description *</Label>
              <Textarea
                id="dish-desc"
                required
                rows={2}
                placeholder="Rich description of ingredients, preparation, and heritage..."
                value={dishDesc}
                onChange={(e) => setDishDesc(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 items-end gap-2.5 sm:gap-3">
              <div className="space-y-1">
                <Label>Category *</Label>
                <Select
                  value={dishCategoryId}
                  onValueChange={setDishCategoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Dietary Type *</Label>
                <Select
                  value={dishDietary}
                  onValueChange={(val) =>
                    setDishDietary(val as "VEG" | "NON_VEG")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NON_VEG">Non-Veg</SelectItem>
                    <SelectItem value="VEG">Pure Veg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 items-end gap-2.5 sm:grid-cols-3 sm:gap-3">
              <div className="space-y-1">
                <Label htmlFor="dish-price">Price (₹) *</Label>
                <Input
                  id="dish-price"
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={dishPrice}
                  onChange={(e) => setDishPrice(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="dish-pack">Packaging (₹) *</Label>
                <Input
                  id="dish-pack"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={dishPackaging}
                  onChange={(e) => setDishPackaging(e.target.value)}
                />
              </div>

              <div className="col-span-2 space-y-1 sm:col-span-1">
                <Label htmlFor="dish-serves">Serves Info</Label>
                <Input
                  id="dish-serves"
                  placeholder="Serves 1-2"
                  value={dishServes}
                  onChange={(e) => setDishServes(e.target.value)}
                />
              </div>
            </div>

            {/* Image Upload OR External URL */}
            <div className="space-y-2 rounded-xl border border-primary/25 bg-background/70 p-3">
              <Label htmlFor="dish-image-url">
                Dish Photography (Upload Local File or Paste URL)
              </Label>
              <Input
                id="dish-image-url"
                placeholder="https://images.unsplash.com/..."
                value={dishImageUrl}
                onChange={(e) => setDishImageUrl(e.target.value)}
              />
              <div className="flex items-center justify-between gap-2 pt-1">
                <label className="inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-primary/40 bg-card px-3 py-1.5 text-xs font-medium text-primary hover:bg-secondary">
                  {uploadingImage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {uploadingImage
                      ? "Uploading..."
                      : "Upload Local Photo (/public/uploads)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {dishImageUrl && (
                  <img
                    src={dishImageUrl}
                    alt="Preview"
                    className="h-9 w-9 rounded-lg object-cover border border-primary/40"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-background/60 p-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={dishSignature}
                  onCheckedChange={setDishSignature}
                />
                <span className="flex items-center gap-1 text-xs font-medium text-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Chef&apos;s Signature
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={dishAvailable}
                  onCheckedChange={setDishAvailable}
                />
                <span className="text-xs font-medium text-foreground">
                  Available In Stock
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDishModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingDish}>
                {savingDish ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : editingDish ? (
                  "Update Dish"
                ) : (
                  "Create Dish"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
