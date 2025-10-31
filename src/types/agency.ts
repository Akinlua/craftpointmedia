export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number | { min: number; max: number };
  deliveryTime: string;
  tags: string[];
  featured?: boolean;
  freelancerIds?: string[];
}

export interface Freelancer {
  id: string;
  name: string;
  avatarUrl?: string;
  skills: string[];
  rating?: number;
  bio?: string;
}

export interface Order {
  id: string;
  clientId: string;
  serviceId: string;
  freelancerId?: string;
  status: "new" | "in-progress" | "delivered" | "completed";
  createdAt: string;
  deliveryDate?: string;
  total: number;
  attachments?: string[];
  notes?: string;
  brief?: string;
  timeline?: OrderTimelineEvent[];
}

export interface OrderTimelineEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: "created" | "assigned" | "update" | "delivered" | "completed";
}

export interface ClientKPI {
  activeOrders: number;
  completedProjects: number;
  totalSpent: number;
  topFreelancer?: Freelancer;
}

export interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "order" | "delivery" | "message" | "revision";
}