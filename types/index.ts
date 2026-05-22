export interface CustomerAddress {
  name: string;
  country_id: number | null;
  zip_code: string;
  city: string;
  address: string;
}

export interface Customer {
  id: number;
  name: string;
  internal_name: string;
  is_seller: boolean;
  is_buyer: boolean;
  description: string;
  tax_number: string;
  customer_group_id: number | null;
  user_id: number | null;
  currency_id: number | null;
  language_id: number | null;
  invoice_address_id: number | null;
  shipping_address_id: number | null;
  customer_group?: CustomerGroup;
  user?: { id: number; name: string; email: string };
  currency?: { id: number; name: string };
  language?: { id: number; name: string };
  invoice_address?: CustomerAddress | null;
  shipping_address?: CustomerAddress | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerGroup {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CustomerGroupListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

