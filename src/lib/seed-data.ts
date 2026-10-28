import { DietaryType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const INITIAL_STORE_SETTINGS = {
  id: "default",
  storeName: "Gulmarg Cloud Kitchen",
  isAcceptingOrders: true,
  deliveryFee: 40.0,
  freeDeliveryThreshold: 499.0,
  minOrderAmount: 149.0,
  taxPercentage: 5.0,
  whatsappNumber: "+919876543210",
  fssaiNumber: "22726199000490",
  serviceablePincodes: "ALL",
};

export const INITIAL_CATEGORIES = [
  {
    name: "Wazwan Signatures",
    slug: "wazwan-signatures",
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "Royal Biryanis & Pulao",
    slug: "royal-biryanis-pulao",
    sortOrder: 2,
    isActive: true,
  },
  {
    name: "Artisanal Kebabs",
    slug: "artisanal-kebabs",
    sortOrder: 3,
    isActive: true,
  },
  {
    name: "Kashmiri Beverages & Desserts",
    slug: "kashmiri-beverages-desserts",
    sortOrder: 4,
    isActive: true,
  },
];

export interface SeedDishInput {
  name: string;
  description: string;
  price: number;
  packagingCharge: number;
  categorySlug: string;
  dietaryType: DietaryType;
  servesInfo: string;
  imageUrl: string;
  isAvailable: boolean;
  isSignature: boolean;
}

export const INITIAL_DISHES: SeedDishInput[] = [
  {
    name: "Mutton Rogan Josh",
    description:
      "Slow-braised prime Kashmiri lamb shanks simmered in an aromatic gravy of Pampore saffron, Kashmiri alkanet root (Ratanjot), fennel, and dry ginger.",
    price: 540,
    packagingCharge: 25,
    categorySlug: "wazwan-signatures",
    dietaryType: DietaryType.NON_VEG,
    servesInfo: "Serves 2",
    imageUrl:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isSignature: true,
  },
  {
    name: "Kashmiri Gushtaba",
    description:
      "The Crown Jewel of Wazwan — velvety hand-pounded mutton meatballs poached in a rich, spiced Kashmiri yogurt gravy infused with black cardamom and dried mint.",
    price: 590,
    packagingCharge: 25,
    categorySlug: "wazwan-signatures",
    dietaryType: DietaryType.NON_VEG,
    servesInfo: "Serves 2",
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isSignature: true,
  },
  {
    name: "Nadru Yakhni",
    description:
      "Crisp Dal Lake lotus stems delicately slow-cooked in a silken yogurt reduction with crushed fennel seeds, green cardamom, and royal shahi jeera.",
    price: 360,
    packagingCharge: 20,
    categorySlug: "wazwan-signatures",
    dietaryType: DietaryType.VEG,
    servesInfo: "Serves 1-2",
    imageUrl:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isSignature: true,
  },
  {
    name: "Dum Aloo Kashmiri",
    description:
      "Golden baby potatoes pricked and slow-cooked on dum in a vibrant ruby gravy of Kashmiri Lal Mirch, sweet fennel, and aromatic heirloom spices.",
    price: 340,
    packagingCharge: 20,
    categorySlug: "wazwan-signatures",
    dietaryType: DietaryType.VEG,
    servesInfo: "Serves 1-2",
    imageUrl:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isSignature: false,
  },
  {
    name: "Zafrani Chicken Biryani",
    description:
      "Aged long-grain basmati layered with saffron milk, tender char-spiced chicken, caramelized shallots, and toasted Kashmiri walnuts sealed in handi dum.",
    price: 460,
    packagingCharge: 25,
    categorySlug: "royal-biryanis-pulao",
    dietaryType: DietaryType.NON_VEG,
    servesInfo: "Serves 2",
    imageUrl:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isSignature: true,
  },
  {
    name: "Modur Pulao",
    description:
      "Fragrant sweet saffron rice jewelled with roasted Gurez almonds, golden raisins, pistachios, dates, and pure desi ghee.",
    price: 320,
    packagingCharge: 20,
    categorySlug: "royal-biryanis-pulao",
    dietaryType: DietaryType.VEG,
    servesInfo: "Serves 1-2",
    imageUrl:
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isSignature: false,
  },
  {
    name: "Tabak Maaz",
    description:
      "Crisp, twice-cooked Kashmiri lamb ribs simmered in saffron-spiced milk and shallow-seared in pure cow's ghee until golden and crackling.",
    price: 520,
    packagingCharge: 20,
    categorySlug: "artisanal-kebabs",
    dietaryType: DietaryType.NON_VEG,
    servesInfo: "Serves 2",
    imageUrl:
      "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isSignature: true,
  },
  {
    name: "Seekh Kebab Platter",
    description:
      "Charcoal-grilled minced lamb skewers seasoned with fresh coriander, Kashmiri chili, and roasted cumin, served with walnut-mint chutney.",
    price: 440,
    packagingCharge: 20,
    categorySlug: "artisanal-kebabs",
    dietaryType: DietaryType.NON_VEG,
    servesInfo: "Serves 2",
    imageUrl:
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isSignature: false,
  },
  {
    name: "Kong Phirni",
    description:
      "Chilled semolina and slow-reduced milk pudding infused with Pampore Mongra saffron, cardamom pods, and slivered pistachios in clay kasoras.",
    price: 220,
    packagingCharge: 15,
    categorySlug: "kashmiri-beverages-desserts",
    dietaryType: DietaryType.VEG,
    servesInfo: "Serves 1-2",
    imageUrl:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isSignature: true,
  },
  {
    name: "Noon Chai / Kahwa",
    description:
      "Authentic Samovar-brewed Kashmiri saffron Kahwa with crushed almonds and cinnamon sticks, or traditional pink salted pistachio Noon Chai.",
    price: 160,
    packagingCharge: 15,
    categorySlug: "kashmiri-beverages-desserts",
    dietaryType: DietaryType.VEG,
    servesInfo: "Serves 2 Cups",
    imageUrl:
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=80",
    isAvailable: true,
    isSignature: false,
  },
];

export async function seedRoyalGulmargMenu(forceReset = false) {
  // 1. Ensure default StoreSettings exists
  const settings = await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: INITIAL_STORE_SETTINGS,
  });

  const existingDishCount = await prisma.dish.count();
  if (existingDishCount > 0 && !forceReset) {
    return {
      seeded: false,
      message:
        "Menu already contains dishes. Categories and store settings verified.",
      settings,
      categoriesCount: await prisma.category.count(),
      dishesCount: existingDishCount,
    };
  }

  // 2. Upsert categories
  const categoryMap = new Map<string, string>();
  for (const cat of INITIAL_CATEGORIES) {
    const upsertedCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
      },
      create: cat,
    });
    categoryMap.set(cat.slug, upsertedCat.id);
  }

  // 3. Create dishes if not already present by name
  let createdDishes = 0;
  for (const dish of INITIAL_DISHES) {
    const categoryId = categoryMap.get(dish.categorySlug);
    if (!categoryId) continue;

    const existing = await prisma.dish.findFirst({
      where: { name: dish.name },
    });

    if (!existing) {
      await prisma.dish.create({
        data: {
          name: dish.name,
          description: dish.description,
          price: dish.price,
          packagingCharge: dish.packagingCharge,
          categoryId,
          dietaryType: dish.dietaryType,
          servesInfo: dish.servesInfo,
          imageUrl: dish.imageUrl,
          isAvailable: dish.isAvailable,
          isSignature: dish.isSignature,
        },
      });
      createdDishes++;
    }
  }

  return {
    seeded: true,
    message: `Royal Gulmarg Menu seeded with ${INITIAL_CATEGORIES.length} categories and ${createdDishes} authentic Wazwan dishes.`,
    settings,
    categoriesCount: await prisma.category.count(),
    dishesCount: await prisma.dish.count(),
  };
}
