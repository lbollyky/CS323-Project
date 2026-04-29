export type ProductType = "OTC" | "Rx";

export type OrderStatus = "pending_rx" | "approved" | "shipped";

export type ProductCategory =
  | "Foundational"
  | "Athletic Performance"
  | "Cognitive"
  | "Sleep & Recovery"
  | "Longevity"
  | "Hormones"
  | "Weight Management"
  | "Stress & Mood";

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  goal_profile: GoalProfile | null;
}

export interface GoalProfile {
  goals: string[];
  current_stats: Record<string, string | number>;
  symptoms: string[];
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  price: number;
  image_url: string | null;
  category: ProductCategory;
  tag_line: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
}

export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  products_taken: string[];
  weight: number | null;
  energy_level: number;
  side_effects: string | null;
  notes: string | null;
}
