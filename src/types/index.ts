// 全局类型定义

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  productName: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  keyword?: string;
  status?: string;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
  topProducts: Product[];
}

export type WeatherType = 'sunny' | 'rain' | 'heat' | 'wind';

export interface WeatherEffect {
  gatherEfficiency: number;
  mapEventRate: number;
  shelterDamage: number;
  waterConsumption: number;
  foodConsumption: number;
}

export interface Weather {
  type: WeatherType;
  name: string;
  icon: string;
  description: string;
  effect: WeatherEffect;
}

export interface WeatherForecast {
  day: number;
  weather: WeatherType;
  date: string;
}

export interface Shelter {
  level: number;
  durability: number;
  maxDurability: number;
  built: boolean;
}