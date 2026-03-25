using AutoMapper;
using BatchDtoType = EventosAPI.Application.DTOs.BatchDto;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Exceptions;
using EventosAPI.Application.Interfaces;
using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Enums;
using EventosAPI.Domain.Interfaces.Repositories;

namespace EventosAPI.Application.Services
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _eventRepository;
        private readonly IUserRepository _userRepository;
        private readonly IBatchService _batchService;
        private readonly IMapper _mapper;

        public EventService(
            IEventRepository eventRepository,
            IUserRepository userRepository,
            IBatchService batchService,
            IMapper mapper)
        {
            _eventRepository = eventRepository;
            _userRepository = userRepository;
            _batchService = batchService;
            _mapper = mapper;
        }

        public async Task<EventDto?> GetByIdAsync(Guid id)
        {
            var @event = await _eventRepository.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(Event), id);

            var dto = _mapper.Map<EventDto>(@event);
            dto.AvailableTickets = await _eventRepository.GetAvailableTicketsCountAsync(id);
            return dto;
        }

        public async Task<IEnumerable<EventDto>> GetAllAsync()
        {
            var events = await _eventRepository.GetAllAsync();
            var dtos = _mapper.Map<IEnumerable<EventDto>>(events);
            await PopulateAvailableTickets(dtos);
            return dtos;
        }

        public async Task<IEnumerable<EventDto>> GetActiveEventsAsync()
        {
            var events = await _eventRepository.GetActiveEventsAsync();
            var dtos = _mapper.Map<IEnumerable<EventDto>>(events);
            await PopulateAvailableTickets(dtos);
            return dtos;
        }

        public async Task<IEnumerable<EventDto>> GetEventsByOrganizerAsync(Guid organizerId)
        {
            var events = await _eventRepository.GetEventsByOrganizerAsync(organizerId);
            var dtos = _mapper.Map<IEnumerable<EventDto>>(events);
            await PopulateAvailableTickets(dtos);
            return dtos;
        }

        public async Task<EventDto> CreateAsync(CreateEventDto createEventDto, Guid organizerId)
        {
            // Validate and get organizer
            var organizer = await _userRepository.GetByIdAsync(organizerId)
                ?? throw new NotFoundException(nameof(User), organizerId);

            try
            {
                // Create event using constructor and required properties
                var @event = new Event(
                    name: createEventDto.Name,
                    description: createEventDto.Description,
                    location: createEventDto.Location,
                    eventDate: createEventDto.EventDate,
                    endDate: createEventDto.EndDate,
                    organizer: organizer,
                    maxParticipants: createEventDto.MaxParticipants,
                    category: createEventDto.Category)
                {
                    Name = createEventDto.Name,
                    Description = createEventDto.Description,
                    Location = createEventDto.Location
                };

                // Set optional properties
                if (!string.IsNullOrEmpty(createEventDto.ImageUrl))
                {
                    @event.ImageUrl = createEventDto.ImageUrl;
                }

                // Domain validation
                if (!@event.Validate(out var errors))
                    throw new ValidationException(errors);

                // Save to database
                @event = await _eventRepository.CreateAsync(@event);

                // Map to DTO and add available tickets count
                var eventDto = _mapper.Map<EventDto>(@event);
                eventDto.AvailableTickets = @event.MaxParticipants;
                return eventDto;
            }
            catch (ArgumentException ex)
            {
                throw new ValidationException(new[] { ex.Message });
            }
        }

        public async Task UpdateAsync(Guid id, UpdateEventDto updateEventDto)
        {
            var @event = await _eventRepository.GetByIdAsync(id)
                ?? throw new NotFoundException("Event", id);

            // Update basic event properties
            if (updateEventDto.Name != null)
                @event.Name = updateEventDto.Name;
            if (updateEventDto.Description != null)
                @event.Description = updateEventDto.Description;
            if (updateEventDto.Location != null)
                @event.Location = updateEventDto.Location;
            if (updateEventDto.Category.HasValue)
                @event.Category = updateEventDto.Category.Value;
            if (updateEventDto.MaxParticipants.HasValue)
                @event.MaxParticipants = updateEventDto.MaxParticipants.Value;
            if (updateEventDto.EventDate.HasValue && updateEventDto.EndDate.HasValue)
            {
                var eventDate = updateEventDto.EventDate.Value;
                var endDate = updateEventDto.EndDate.Value;
                if (eventDate >= endDate)
                    throw new ValidationException(new Dictionary<string, string[]>
                    {
                        { "EndDate", new[] { "Event end date must be after start date" } }
                    });
                @event.EventDate = eventDate;
                @event.EndDate = endDate;
            }
            else if (updateEventDto.EventDate.HasValue || updateEventDto.EndDate.HasValue)
            {
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    { "EventDate", new[] { "Both event start and end dates must be provided together" } }
                });
            }
            if (updateEventDto.ImageUrl != null)
                @event.ImageUrl = updateEventDto.ImageUrl;
            if (updateEventDto.IsActive.HasValue)
            {
                if (updateEventDto.IsActive.Value && @event.HasEnded)
                    throw new ValidationException(new Dictionary<string, string[]>
                    {
                        { "IsActive", new[] { "Cannot activate an ended event" } }
                    });
                if (!updateEventDto.IsActive.Value && @event.HasSoldTickets())
                    throw new ValidationException(new Dictionary<string, string[]>
                    {
                        { "IsActive", new[] { "Cannot deactivate an event with sold tickets" } }
                    });
            }

            // Handle batch updates using BatchService
            if (updateEventDto.Batches != null)
            {
                foreach (var batchDto in updateEventDto.Batches)
                {
                    if (batchDto == null)
                        continue;
                    if (batchDto.Id != Guid.Empty)
                    {
                        var updateBatchDto = new UpdateBatchDto
                        {
                            Name = batchDto.Name,
                            Type = batchDto.Type,
                            UnitPrice = batchDto.UnitPrice,
                            TotalQuantity = batchDto.TotalQuantity,
                            StartDate = batchDto.StartDate,
                            EndDate = batchDto.EndDate,
                            IsActive = batchDto.IsActive
                        };
                        await _batchService.UpdateAsync(batchDto.Id, updateBatchDto);
                    }
                    else
                    {
                        var createBatchDto = new CreateBatchDto
                        {
                            EventId = @event.Id,
                            Name = batchDto.Name,
                            Type = batchDto.Type,
                            UnitPrice = batchDto.UnitPrice,
                            TotalQuantity = batchDto.TotalQuantity
                        };
                        if (batchDto.StartDate.HasValue)
                            createBatchDto.StartDate = batchDto.StartDate.Value;
                        if (batchDto.EndDate.HasValue)
                            createBatchDto.EndDate = batchDto.EndDate.Value;
                        await _batchService.CreateAsync(createBatchDto);
                    }
                }
            }

            // Handle batch deletions
            if (updateEventDto.Batches != null)
            {
                var existingBatchIds = @event.Batches.Select(b => b.Id).ToList();
                var updatedBatchIds = updateEventDto.Batches.Where(b => b != null && b.Id != Guid.Empty).Select(b => b.Id).ToList();
                var batchesToDelete = existingBatchIds.Except(updatedBatchIds).ToList();
                foreach (var batchId in batchesToDelete)
                {
                    await _batchService.DeleteAsync(batchId);
                }
            }

            if (!@event.Validate(out var validationErrors))
                throw new ValidationException(new Dictionary<string, string[]>
                {
                    { "Event", validationErrors.ToArray() }
                });

            await _eventRepository.UpdateAsync(@event);
        }

        public async Task DeleteAsync(Guid id)
        {
            var @event = await _eventRepository.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(Event), id);

            // Check if the event can be deleted
            if (@event.HasStarted)
                throw new BusinessRuleException("Cannot delete an event that has already started");
            if (@event.HasSoldTickets())
                throw new BusinessRuleException("Cannot delete an event that has sold tickets");

            await _eventRepository.DeleteAsync(id);
        }

        public async Task<bool> HasAvailableTicketsAsync(Guid eventId)
        {
            var @event = await _eventRepository.GetByIdAsync(eventId)
                ?? throw new NotFoundException(nameof(Event), eventId);

            return @event.HasAvailableTickets;
        }

        public async Task<int> GetAvailableTicketsCountAsync(Guid eventId)
        {
            var @event = await _eventRepository.GetByIdAsync(eventId)
                ?? throw new NotFoundException(nameof(Event), eventId);

            return await _eventRepository.GetAvailableTicketsCountAsync(eventId);
        }

        public async Task<BatchDto> CreateBatchAsync(Guid eventId, CreateBatchDto createBatchDto)
        {
            var @event = await _eventRepository.GetByIdAsync(eventId)
                ?? throw new NotFoundException(nameof(Event), eventId);

            try
            {
                // Validate DTO fields according to batch type
                switch (createBatchDto.Type)
                {
                    case BatchType.Quantity:
                        if (createBatchDto.StartDate != default || createBatchDto.EndDate != default)
                            throw new ValidationException(new[] { "Quantity batches should not have start or end dates." });
                        break;
                    case BatchType.TimeWindow:
                        if (createBatchDto.StartDate == default || createBatchDto.EndDate == default)
                            throw new ValidationException(new[] { "TimeWindow batches must have both start and end dates." });
                        break;
                    case BatchType.Free:
                        if (createBatchDto.UnitPrice != 0)
                            throw new ValidationException(new[] { "Free batches must have unit price 0." });
                        // Dates are optional for Free, but if provided, must be valid
                        break;
                }

                // Call domain method with correct parameters
                var batch = @event.CreateBatch(
                    createBatchDto.Name,
                    createBatchDto.Type,
                    createBatchDto.UnitPrice,
                    createBatchDto.TotalQuantity,
                    createBatchDto.StartDate != default ? createBatchDto.StartDate : (DateTime?)null,
                    createBatchDto.EndDate != default ? createBatchDto.EndDate : (DateTime?)null
                );

                await _eventRepository.UpdateAsync(@event);
                return _mapper.Map<BatchDto>(batch);
            }
            catch (Exception ex) when (ex is InvalidOperationException || ex is ArgumentException)
            {
                throw new BusinessRuleException(ex.Message);
            }
        }

        public async Task<BatchDto> UpdateBatchAsync(Guid eventId, Guid batchId, UpdateBatchDto updateBatchDto)
        {
            var @event = await _eventRepository.GetByIdAsync(eventId)
                ?? throw new NotFoundException(nameof(Event), eventId);

            try
            {
                @event.UpdateBatch(
                    batchId,
                    updateBatchDto.Name,
                    updateBatchDto.UnitPrice,
                    updateBatchDto.TotalQuantity,
                    updateBatchDto.StartDate,
                    updateBatchDto.EndDate,
                    updateBatchDto.IsActive
                );

                await _eventRepository.UpdateAsync(@event);
                var updatedBatch = @event.Batches.FirstOrDefault(b => b.Id == batchId)
                    ?? throw new NotFoundException(nameof(Batch), batchId);

                return _mapper.Map<BatchDto>(updatedBatch);
            }
            catch (InvalidOperationException ex)
            {
                throw new BusinessRuleException(ex.Message);
            }
        }

        public async Task DeleteBatchAsync(Guid eventId, Guid batchId)
        {
            var @event = await _eventRepository.GetByIdAsync(eventId)
                ?? throw new NotFoundException(nameof(Event), eventId);

            try
            {
                @event.RemoveBatch(batchId);
                await _eventRepository.UpdateAsync(@event);
            }
            catch (InvalidOperationException ex)
            {
                throw new BusinessRuleException(ex.Message);
            }
        }

        private async Task PopulateAvailableTickets(IEnumerable<EventDto> dtos)
        {
            foreach (var dto in dtos)
            {
                dto.AvailableTickets = await _eventRepository.GetAvailableTicketsCountAsync(dto.Id);
            }
        }

        public async Task<IEnumerable<EventDto>> GetEventsByUserRolesAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId)
                ?? throw new NotFoundException(nameof(User), userId);

            // If admin just return all events
            if (user.IsAdminMaster())
            {
                return await GetAllAsync();
            }

            var events = await _eventRepository.GetEventsByUserRolesAsync(userId);
            var dtos = _mapper.Map<IEnumerable<EventDto>>(events);
            await PopulateAvailableTickets(dtos);
            return dtos;
        }

        public async Task<Guid> GetEventOwnerIdAsync(Guid eventId)
        {
            var @event = await _eventRepository.GetByIdAsync(eventId)
                ?? throw new NotFoundException(nameof(Event), eventId);
            return @event.OrganizerId;
        }
        
        public async Task<bool> IsEventOrganizerAsync(Guid eventId, Guid userId)
        {
            var @event = await _eventRepository.GetByIdAsync(eventId)
                ?? throw new NotFoundException(nameof(Event), eventId);
            return @event.OrganizerId == userId;
        }
    }
}
