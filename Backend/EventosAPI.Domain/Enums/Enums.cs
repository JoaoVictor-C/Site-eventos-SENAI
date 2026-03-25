namespace EventosAPI.Domain.Enums
{
    public enum UserRole
    {
        User = 1,
        Admin = 2,
        Moderator = 4,
        Gatekeeper = 8
    }

    [Flags]
    public enum EventRoleType
    {
        None = 0,
        ViewEvent = 1,             // Can view event details 
        ManageTickets = 2,         // Can validate/scan tickets
        ManageRoles = 4,           // Can assign/remove roles
        ManageEvent = 8,           // Can edit event details
        ManageBatches = 16,        // Can manage ticket batches
        ViewReports = 32,          // Can view event reports/analytics

        Gatekeeper = ViewEvent | ManageTickets,
        Moderator = ViewEvent | ManageTickets | ViewReports,
        Admin = ViewEvent | ManageTickets | ManageRoles | ManageEvent | ManageBatches | ViewReports
    }

    public enum PaymentMethod
    {
        Free,
        Pix,
        Cash,
        Card,
        Other
    }

    public enum OrderStatus
    {
        Reserved,
        Pending,
        Paid,
        Canceled,
        Expired
    }

    public enum TicketType
    {
        Student,
        Staff,
        Other
    }

    public enum TicketStatus
    {
        Pending,
        Paid,
        Used,
        Expired,
        Canceled
    }

        public enum BatchType
    {
        Quantity = 0,
        TimeWindow = 1,
        Free = 2
    }

    public enum EventCategory
    {
        Technology,
        Business,
        Education,
        Entertainment,
        Sports,
        Health,
        Other
    }
}
