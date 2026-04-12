export interface User {
  telegram_id: string;
  first_name?: string;
  username?: string;
  balance: number;
  hold_balance: number;
  total_deposits: number;
  total_orders: number;
  created_at: string;
  last_active?: string;
  is_blocked: boolean;
}

export interface Order {
  order_id: string;
  telegram_id: string;
  game: string;
  game_icon?: string;
  player_id?: string;
  server_id?: string;
  package_name?: string;
  package_price?: number;
  status: 'pending' | 'processing' | 'delivered' | 'declined' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  topup_status: 'pending' | 'processing' | 'delivered' | 'failed';
  sell_price: number;
  payment_method?: string;
  transaction_id?: string;
  notes?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
}

export interface Deposit {
  telegram_id: string;
  amount: number;
  admin: string;
  type: 'manual' | 'refund' | 'bonus' | 'adjustment';
  status: 'pending' | 'completed' | 'failed';
  reference?: string;
  notes?: string;
  created_at: string;
}

export interface AdminUser {
  username: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
}

export interface DashboardStats {
  users: {
    total: number;
    active: number;
  };
  orders: {
    total: number;
    pending: number;
  };
  deposits: {
    total: number;
    today: number;
  };
  revenue: {
    total: number;
    week: number;
  };
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}
