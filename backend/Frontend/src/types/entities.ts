import {
  BatchType,
  EventCategory,
  EventRoleType,
  OrderStatus,
  PaymentMethod,
  TicketStatus,
  TicketType,
  UserRole
} from './enums';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
}

export interface Event extends BaseEntity {
  name: string;
  description: string;
  eventDate: string;
  endDate: string;
  location: string;
  imageUrl?: string;
  isActive: boolean;
  maxParticipants: number;
  category: EventCategory;
  organizerId: string;
  organizer: User;
  batches: Batch[];
  eventRoles: EventRole[];
  
  // Computed properties
  hasAvailableTickets: boolean;
  isOpen: boolean;
  hasStarted: boolean;
  hasEnded: boolean;
  availableTickets?: number;
}

export interface Batch extends BaseEntity {
  eventId: string;
  event?: Event;
  name: string;
  type: BatchType;
  unitPrice: number;
  totalQuantity: number;
  stock: number;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  tickets: Ticket[];
  
  // Computed properties
  hasStarted: boolean;
  hasEnded: boolean;
  isAvailable: boolean;
  hasStock: boolean;
  isInTimeWindow?: boolean;
}

export interface EventRole extends BaseEntity {
  userId: string;
  user: User;
  eventId: string;
  event: Event;
  roleType: EventRoleType;
}

export interface Order extends BaseEntity {
  userId: string;
  userName: string;
  eventId: string;
  eventName: string;
  orderDate: string;
  total: number;
  quantity: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  validatedByUserId?: string;
  validatedByUser?: User;
  tickets: Ticket[];
  isReserved?: boolean;
  isPending?: boolean;
  isPaid?: boolean;
  isCanceled?: boolean;
  isExpired?: boolean;
  canBePaid?: boolean;
  isValidated?: boolean;
}

export interface Ticket extends BaseEntity {
  orderId: string;
  order: Order;
  batchId: string;
  batch: Batch;
  userId: string;
  user: User;
  status: TicketStatus;
  type: TicketType;
  usedAt?: string;
  isActive: boolean;
  price: number;
  qrCode: string;
  isUsed?: boolean;
  isCanceled?: boolean;
  isExpired?: boolean;
  isValid?: boolean;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  organizedEvents?: Event[];
  orders?: Order[];
  validatedOrders?: Order[];
  tickets?: Ticket[];
  refreshTokens?: RefreshToken[];
  eventRoles?: EventRole[];
}

export interface RefreshToken extends BaseEntity {
  token: string;
  expiryDate: string;
  isRevoked: boolean;
  userId: string;
  user: User;
  replacedByToken?: string;
  revokedAt?: string;
  reasonRevoked?: string;
  isExpired?: boolean;
  isActive?: boolean;
}
