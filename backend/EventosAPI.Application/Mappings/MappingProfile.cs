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
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Batch mappings
            CreateMap<Batch, BatchDto>()
                .ForMember(dest => dest.Event, opt => opt.MapFrom(src => src.Event));
            CreateMap<CreateBatchDto, Batch>();
            CreateMap<UpdateBatchDto, Batch>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Order mappings
            CreateMap<Order, OrderDto>()
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User))
                .ForMember(dest => dest.ValidatedByUser, opt => opt.MapFrom(src => src.ValidatedByUser))
                .ForMember(dest => dest.Tickets, opt => opt.MapFrom(src => src.Tickets));
            CreateMap<CreateOrderDto, Order>();
            CreateMap<UpdateOrderDto, Order>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<Order, OrderSummaryDto>()
                .ForMember(dest => dest.EventName, opt => opt.MapFrom(src => src.Tickets.FirstOrDefault().Batch.Event.Name))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.Name));

            // Ticket mappings
            CreateMap<Ticket, TicketDto>()
                .ForMember(dest => dest.Batch, opt => opt.MapFrom(src => src.Batch))
                .ForMember(dest => dest.Order, opt => opt.MapFrom(src => src.Order));
            CreateMap<CreateTicketDto, Ticket>();
            CreateMap<UpdateTicketDto, Ticket>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}
