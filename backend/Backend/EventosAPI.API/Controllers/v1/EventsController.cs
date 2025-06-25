using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Interfaces;

namespace EventosAPI.API.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class EventsController : ApiControllerBase
    {
        private readonly IEventService _eventService;

        public EventsController(IEventService eventService)
        {
            _eventService = eventService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var events = await _eventService.GetAllAsync();
            return HandleSuccess(events);
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveEvents()
        {
            var events = await _eventService.GetActiveEventsAsync();
            return HandleSuccess(events);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var @event = await _eventService.GetByIdAsync(id);
            if (@event == null)
                return HandleError("Evento não encontrado", 404);
            return HandleSuccess(@event);
        }

        [HttpGet("my-events")]
        [Authorize]
        public async Task<IActionResult> GetMyEvents()
        {
            var organizerId = GetCurrentUserId();
            var events = await _eventService.GetEventsByOrganizerAsync(organizerId);
            return HandleSuccess(events);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateEventDto createEventDto)
        {
            var organizerId = GetCurrentUserId();
            var @event = await _eventService.CreateAsync(createEventDto, organizerId);
            return HandleSuccess(@event, "Evento criado com sucesso");
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEventDto updateEventDto)
        {
            var currentUserId = GetCurrentUserId();
            if (!await _eventService.HasEventRoleAsync(id, currentUserId, EventosAPI.Domain.Enums.EventRoleType.ManageEvent))
                return HandleError("Forbidden", 403);
            await _eventService.UpdateAsync(id, updateEventDto);
            return HandleSuccess<object>(null, "Evento atualizado com sucesso");
        }

        [HttpPost("{id}/batches")]
        [Authorize]
        public async Task<IActionResult> CreateBatch(Guid id, [FromBody] CreateBatchDto createBatchDto)
        {
            var currentUserId = GetCurrentUserId();
            if (!await _eventService.HasEventRoleAsync(id, currentUserId, EventosAPI.Domain.Enums.EventRoleType.ManageBatches))
                return HandleError("Forbidden", 403);
            createBatchDto.EventId = id;
            var batch = await _eventService.CreateBatchAsync(id, createBatchDto);
            return HandleSuccess(batch, "Lote criado com sucesso");
        }

        [HttpPut("{eventId}/batches/{batchId}")]
        [Authorize]
        public async Task<IActionResult> UpdateBatch(Guid eventId, Guid batchId, [FromBody] UpdateBatchDto updateBatchDto)
        {
            var currentUserId = GetCurrentUserId();
            if (!await _eventService.HasEventRoleAsync(eventId, currentUserId, EventosAPI.Domain.Enums.EventRoleType.ManageBatches))
                return HandleError("Forbidden", 403);
            var batch = await _eventService.UpdateBatchAsync(eventId, batchId, updateBatchDto);
            return HandleSuccess(batch, "Lote atualizado com sucesso");
        }

        [HttpDelete("{eventId}/batches/{batchId}")]
        [Authorize]
        public async Task<IActionResult> DeleteBatch(Guid eventId, Guid batchId)
        {
            var currentUserId = GetCurrentUserId();
            if (!await _eventService.HasEventRoleAsync(eventId, currentUserId, EventosAPI.Domain.Enums.EventRoleType.ManageBatches))
                return HandleError("Forbidden", 403);
            await _eventService.DeleteBatchAsync(eventId, batchId);
            return HandleSuccess<object>(null, "Lote removido com sucesso");
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var currentUserId = GetCurrentUserId();
            if (!await _eventService.HasEventRoleAsync(id, currentUserId, EventosAPI.Domain.Enums.EventRoleType.ManageEvent))
                return HandleError("Forbidden", 403);
            await _eventService.DeleteAsync(id);
            return HandleSuccess<object>(null, message: "Evento excluído com sucesso");
        }

        [HttpGet("{id}/available-tickets")]
        public async Task<IActionResult> GetAvailableTicketsCount(Guid id)
        {
            var count = await _eventService.GetAvailableTicketsCountAsync(id);
            return HandleSuccess(new { availableTickets = count });
        }
    }
}
