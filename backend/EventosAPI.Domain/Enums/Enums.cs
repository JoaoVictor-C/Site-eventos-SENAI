namespace EventosAPI.Domain.Enums
{
    public enum UserRole
    {
        User,
        Admin,
        Gatekeeper
    }

    public enum PaymentMethod
    {
        Pix,
        Cash,
        Card,
        Other
    }

    public enum OrderStatus
    {
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
        Quantity,
        Time,
        Free
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
