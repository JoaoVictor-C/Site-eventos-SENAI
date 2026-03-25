using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EventosAPI.Domain.Entities;

namespace EventosAPI.Infrastructure.Data.Configurations
{
    public class BatchConfiguration : BaseEntityConfiguration<Batch>
    {
        public override void Configure(EntityTypeBuilder<Batch> builder)
        {
            base.Configure(builder);

            builder.Property(b => b.Name)
                .IsRequired()
                .HasMaxLength(45);

            builder.Property(b => b.UnitPrice)
                .IsRequired()
                .HasPrecision(10, 2);

            builder.Property(b => b.TotalQuantity)
                .IsRequired();

            builder.Property(b => b.Stock)
                .IsRequired();

            builder.Property(b => b.StartDate)
                .IsRequired();

            builder.Property(b => b.EndDate)
                .IsRequired();

            builder.Property(b => b.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(b => b.Type)
                .IsRequired()
                .HasConversion<string>();

            builder.HasOne(b => b.Event)
                .WithMany(e => e.Batches)
                .HasForeignKey(b => b.EventId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
