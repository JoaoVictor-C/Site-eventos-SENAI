using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using EventosAPI.Domain.Entities;

namespace EventosAPI.Infrastructure.Data.Configurations
{
    public class EventRoleConfiguration : BaseEntityConfiguration<EventRole>
    {
        public override void Configure(EntityTypeBuilder<EventRole> builder)
        {
            base.Configure(builder);

            builder.HasOne(er => er.User)
                .WithMany(u => u.EventRoles)
                .HasForeignKey(er => er.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(er => er.Event)
                .WithMany(e => e.EventRoles)
                .HasForeignKey(er => er.EventId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Property(er => er.RoleType)
                .IsRequired();

            // Create a unique constraint for User-Event-RoleType combination
            builder.HasIndex(er => new { er.UserId, er.EventId, er.RoleType })
                .IsUnique();
        }
    }
}
