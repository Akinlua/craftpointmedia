import { create } from 'zustand';
import { Service, Order, Freelancer, ClientKPI, ActivityEvent } from '@/types/agency';
import { mockServices, mockFreelancers, mockOrders, mockActivityEvents } from '@/lib/mocks/agencyMocks';

interface AgencyStore {
  // Services
  services: Service[];
  
  // Orders
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'timeline'>) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  getClientOrders: (clientId: string) => Order[];
  
  // Freelancers
  freelancers: Freelancer[];
  
  // Activity
  activityEvents: ActivityEvent[];
  
  // KPIs
  getClientKPIs: (clientId: string) => ClientKPI;
}

export const useAgencyStore = create<AgencyStore>((set, get) => ({
  // Services
  services: mockServices,

  // Orders
  orders: mockOrders,
  addOrder: (orderData) => {
    const newOrder: Order = {
      ...orderData,
      id: `o_${Date.now()}`,
      createdAt: new Date().toISOString(),
      timeline: [
        {
          id: `t_${Date.now()}`,
          title: "Order Placed",
          description: "Your order has been received and is being reviewed.",
          date: new Date().toISOString(),
          type: "created",
        },
      ],
    };
    set((state) => ({
      orders: [...state.orders, newOrder],
    }));
  },
  updateOrder: (id, updatedOrder) =>
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === id ? { ...order, ...updatedOrder } : order
      ),
    })),
  getClientOrders: (clientId: string) => {
    const { orders } = get();
    return orders.filter((order) => order.clientId === clientId);
  },

  // Freelancers
  freelancers: mockFreelancers,

  // Activity
  activityEvents: mockActivityEvents,

  // KPIs
  getClientKPIs: (clientId: string) => {
    const { orders, freelancers } = get();
    const clientOrders = orders.filter((o) => o.clientId === clientId);
    
    const activeOrders = clientOrders.filter(
      (o) => o.status === 'new' || o.status === 'in-progress'
    ).length;
    
    const completedProjects = clientOrders.filter(
      (o) => o.status === 'completed'
    ).length;
    
    const totalSpent = clientOrders.reduce((sum, o) => sum + o.total, 0);
    
    // Find most frequently used freelancer
    const freelancerCounts = clientOrders.reduce((acc, order) => {
      if (order.freelancerId) {
        acc[order.freelancerId] = (acc[order.freelancerId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const topFreelancerId = Object.entries(freelancerCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];
    
    const topFreelancer = topFreelancerId
      ? freelancers.find((f) => f.id === topFreelancerId)
      : undefined;
    
    return {
      activeOrders,
      completedProjects,
      totalSpent,
      topFreelancer,
    };
  },
}));