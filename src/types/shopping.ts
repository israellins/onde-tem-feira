export interface ShoppingItem {
  id: string;
  userId: string;
  feiraId?: string;
  feiraName?: string;
  item: string;
  quantity: string;
  priceEstimate?: number;
  category: "frutas" | "legumes" | "pasteis" | "peixes" | "temperos" | "outros";
  completed: boolean;
  createdAt: string;
}
