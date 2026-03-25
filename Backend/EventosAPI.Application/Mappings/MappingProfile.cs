using AutoMapper;
using EventosAPI.Application.DTOs;
using EventosAPI.Domain.Entities;

namespace EventosAPI.Application.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings
            CreateMap<User, UserDto>();
            CreateMap<CreateUserDto, User>();
            CreateMap<UpdateUserDto, User>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Event mappings
            CreateMap<Event, EventDto>()
                .ForMember(dest => dest.Organizer, opt => opt.MapFrom(src => src.Organizer));
            CreateMap<CreateEventDto, Event>();
            CreateMap<UpdateEventDto, Event>()
                .ForMember(dest => dest.Batches, opt => opt.Condition(src => src.Batches != null))
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
                
            CreateMap<BatchDto, Batch>()
                .ForMember(dest => dest.Event, opt => opt.Ignore())
                .ForMember(dest => dest.Tickets, opt => opt.Ignore());

            // EventRole mappings
            CreateMap<EventRole, EventRoleDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.Name))
                .ForMember(dest => dest.EventName, opt => opt.MapFrom(src => src.Event.Name));

            // Batch mappings
            CreateMap<Batch, BatchDto>();
            CreateMap<CreateBatchDto, Batch>();
            CreateMap<UpdateBatchDto, Batch>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Order mappings
            CreateMap<Order, OrderDto>()
                .ForMember(dest => dest.ValidatorName, opt => opt.MapFrom(src => src.ValidatedByUser != null ? src.ValidatedByUser.Name : null))
                .ForMember(dest => dest.Tickets, opt => opt.MapFrom(src => src.Tickets))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.Name))
                .ForMember(dest => dest.EventName, opt => opt.MapFrom(src => src.Event.Name));

            // Ticket mappings
            CreateMap<Ticket, TicketDto>()
                .ForMember(dest => dest.Batch, opt => opt.MapFrom(src => src.Batch))
                ;
            CreateMap<CreateTicketDto, Ticket>();
            CreateMap<UpdateTicketDto, Ticket>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
