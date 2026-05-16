export type Category = 'Coffee' | 'Pastries' | 'Breakfast' | 'Lunch' | 'Cold Drinks';
export const CATEGORIES: Category[] = ['Coffee', 'Pastries', 'Breakfast', 'Lunch', 'Cold Drinks'];

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image_url: string;
  available: boolean;
  created_at: string;
}

export type OrderType = 'pickup' | 'delivery';
export type OrderStatus = 'new' | 'preparing' | 'ready' | 'delivered';
export type PaymentMethod = 'cod' | 'card';

export const ORDER_STATUSES: OrderStatus[] = ['new', 'preparing', 'ready', 'delivered'];

export interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

// Snapshot of the delivery address at order time (US format).
export interface OrderAddress {
  street: string;
  apt?: string | null;
  city: string;
  state: string;
  zip: string;
  instructions?: string | null;
}

export interface Order {
  id: string;
  user_id: string | null;
  customer_name: string;
  phone: string;
  order_type: OrderType;
  address: OrderAddress | null;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  promo_code: string | null;
  scheduled_for: string | null;
  notes: string | null;
  status: OrderStatus;
  created_at: string;
}

export interface Customer {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export interface SavedAddress {
  id: string;
  user_id: string;
  label: string;
  street: string;
  apt: string | null;
  city: string;
  state: string;
  zip: string;
  instructions: string | null;
  is_default: boolean;
  created_at: string;
}

// US states (50 + DC) for the address form select.
export const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' }, { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' }, { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' }, { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' }, { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' }, { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' }, { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' }, { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];
