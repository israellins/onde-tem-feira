export interface PriceReport {
  product: string;
  price: string;
}

export interface FeiraPost {
  id: string;
  feiraId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  priceReports?: PriceReport[];
  photoUrl?: string;
  rating?: number;
  createdAt: string;
}
