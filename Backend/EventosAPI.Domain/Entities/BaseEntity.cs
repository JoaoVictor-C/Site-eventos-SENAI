namespace EventosAPI.Domain.Entities
{
    public abstract class BaseEntity
    {
        public Guid Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        
        protected BaseEntity()
        {
            Id = Guid.NewGuid();
            CreatedAt = DateTime.UtcNow;
            IsDeleted = false;
        }

        public virtual bool Validate(out List<string> errors)
        {
            errors = new List<string>();
            
            if (Id == Guid.Empty)
                errors.Add("Id cannot be empty");
                
            if (CreatedAt == default)
                errors.Add("CreatedAt must be set");

            return errors.Count == 0;
        }

        public virtual void BasicValidate()
        {
            if (!Validate(out var errors))
                throw new InvalidOperationException(string.Join(Environment.NewLine, errors));
        }
    }
}
