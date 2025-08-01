export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'intern' | 'admin';
  phone?: string;
  mentor?: string;
  fundraising_goal: number;
  current_amount: number;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  intern_id: string;
  donor_name: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'online' | 'cheque';
  donation_date: string;
  notes?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  created_by: string;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'intern' | 'admin';
}