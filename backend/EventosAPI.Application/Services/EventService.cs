using AutoMapper;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Interfaces;
using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Interfaces.Repositories;

namespace EventosAPI.Application.Services
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;

        public EventService(IEventRepository eventRepository, IMapper mapper)
        {
            _eventRepository = eventRepository;
            _mapper = mapper;
        }

        public async Task<EventDto> GetByIdAsync(Guid id)
        {
            var @event = await _eventRepository.GetByIdAsync(id);
            var dto = _mapper.Map<EventDto>(@event);
            if (dto != null)
            {
                dto.AvailableTickets = await _eventRepository.GetAvailableTicketsCountAsync(id);
            }
            return dto;
        }

        public async Task<IEnumerable<EventDto>> GetAllAsync()
        {
            var events = await _eventRepository.GetAllAsync();
            var dtos = _mapper.Map<IEnumerable<EventDto>>(events);
            foreach (var dto in dtos)
            {
                dto.AvailableTickets = await _eventRepository.GetAvailableTicketsCountAsync(dto.Id);
            }
            return dtos;
        }

        public async Task<IEnumerable<EventDto>> GetActiveEventsAsync()
        {
            var events = await _eventRepository.GetActiveEventsAsync();
            var dtos = _mapper.Map<IEnumerable<EventDto>>(events);
            foreach (var dto in dtos)
            {
                dto.AvailableTickets = await _eventRepository.GetAvailableTicketsCountAsync(dto.Id);
            }
            return dtos;
        }

        public async Task<IEnumerable<EventDto>> GetEventsByOrganizerAsync(Guid organizerId)
        {
            var events = await _eventRepository.GetEventsByOrganizerAsync(organizerId);
            var dtos = _mapper.Map<IEnumerable<EventDto>>(events);
            foreach (var dto in dtos)
            {
                dto.AvailableTickets = await _eventRepository.GetAvailableTicketsCountAsync(dto.Id);
            }
            return dtos;
        }

        public async Task<EventDto> CreateAsync(CreateEventDto createEventDto, Guid organizerId)
        {
            var @event = _mapper.Map<Event>(createEventDto);
            @event.OrganizerId = organizerId;
            
            @event = await _eventRepository.CreateAsync(@event);
            return _mapper.Map<EventDto>(@event);
        }

        public async Task UpdateAsync(Guid id, UpdateEventDto updateEventDto)
        {
            var @event = await _eventRepository.GetByIdAsync(id);
            if (@event == null)
                throw new Exception("Evento não encontrado");

            _mapper.Map(updateEventDto, @event);
            await _eventRepository.UpdateAsync(@event);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _eventRepository.DeleteAsync(id);
        }

        public async Task<bool> HasAvailableTicketsAsync(Guid eventId)
        {
            return await _eventRepository.HasAvailableTicketsAsync(eventId);
        }

        public async Task<int> GetAvailableTicketsCountAsync(Guid eventId)
        {
            return await _eventRepository.GetAvailableTicketsCountAsync(eventId);
        }
    }
}
