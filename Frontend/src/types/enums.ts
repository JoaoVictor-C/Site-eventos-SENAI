export enum EventCategory {
  Technology = 'Technology',
  Music = 'Music',
  Sports = 'Sports',
  Arts = 'Arts',
  Food = 'Food',
  Business = 'Business',
  Education = 'Education',
  Entertainment = 'Entertainment',
  Other = 'Other'
}

export enum BatchType {
  Free = 'Free',
  TimeWindow = 'TimeWindow',
  Quantity = 'Quantity'
}

export enum EventRoleType {
  None = 0,
  ManageEvent = 1,
  ManageTickets = 2,
  ManageRoles = 4,
  ManageBatches = 8,
  ViewReports = 16,
  Moderator = 32 // All permissions
}

export enum UserRole {
  USER = 1,
  ADMIN = 2,
  GATEKEEPER = 3,
}

export enum PaymentMethod {
  Free = 'Free',
  CreditCard = 'CreditCard',
  DebitCard = 'DebitCard',
  PIX = 'PIX',
  BankTransfer = 'BankTransfer'
}

export enum OrderStatus {
  Pending = 'Pending',
  Reserved = 'Reserved',
  Paid = 'Paid',
  Canceled = 'Canceled',
  Expired = 'Expired'
}

export enum TicketStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  USED = 'Used',
  CANCELED = 'Canceled',
  EXPIRED = 'Expired'
}

export enum TicketType {
  Regular = 'Regular',
  VIP = 'VIP',
  Student = 'Student',
  Other = 'Other'
}
