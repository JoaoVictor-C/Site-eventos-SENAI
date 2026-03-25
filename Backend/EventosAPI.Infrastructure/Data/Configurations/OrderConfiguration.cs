using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EventosAPI.Domain.Entities;

namespace EventosAPI.Infrastructure.Data.Configurations
{
    public class OrderConfiguration : BaseEntityConfiguration<Order>
    {
        public override void Configure(EntityTypeBuilder<Order> builder)
        {
            base.Configure(builder);

            builder.Property(o => o.OrderDate)
                .IsRequired();

            builder.Property(o => o.Total)
                .IsRequired()
                .HasPrecision(10, 2);

            builder.Property(o => o.Quantity)
                .IsRequired();

            builder.Property(o => o.PaymentMethod)
                .IsRequired()
                .HasConversion<string>();

            builder.Property(o => o.Status)
                .IsRequired()
                .HasConversion<string>();

            builder.HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(o => o.ValidatedByUser)
                .WithMany(u => u.ValidatedOrders)
                .HasForeignKey(o => o.ValidatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
