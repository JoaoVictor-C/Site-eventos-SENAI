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
                return HandleError("Evento nÃ£o encontrado", 404);
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
            await ValidateEventAccess(id, _eventService, Domain.Enums.EventRoleType.ManageEvent);
            await _eventService.UpdateAsync(id, updateEventDto);
            return HandleSuccess<object>(null, "Evento atualizado com sucesso");
        }

        [HttpPost("{id}/batches")]
        [Authorize]
        public async Task<IActionResult> CreateBatch(Guid id, [FromBody] CreateBatchDto createBatchDto)
        {
            await ValidateEventAccess(id, _eventService, Domain.Enums.EventRoleType.ManageBatches);
            createBatchDto.EventId = id;
            var batch = await _eventService.CreateBatchAsync(id, createBatchDto);
            return HandleSuccess(batch, "Lote criado com sucesso");
        }

        [HttpPut("{eventId}/batches/{batchId}")]
        [Authorize]
        public async Task<IActionResult> UpdateBatch(Guid eventId, Guid batchId, [FromBody] UpdateBatchDto updateBatchDto)
        {
            await ValidateEventAccess(eventId, _eventService, Domain.Enums.EventRoleType.ManageBatches);
            var batch = await _eventService.UpdateBatchAsync(eventId, batchId, updateBatchDto);
            return HandleSuccess(batch, "Lote atualizado com sucesso");
        }

        [HttpDelete("{eventId}/batches/{batchId}")]
        [Authorize]
        public async Task<IActionResult> DeleteBatch(Guid eventId, Guid batchId)
        {
            await ValidateEventAccess(eventId, _eventService, Domain.Enums.EventRoleType.ManageBatches);
            await _eventService.DeleteBatchAsync(eventId, batchId);
            return HandleSuccess<object>(null, "Lote removido com sucesso");
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            await ValidateEventAccess(id, _eventService, Domain.Enums.EventRoleType.ManageEvent);
            await _eventService.DeleteAsync(id);
            return HandleSuccess<object>(null, message: "Evento excluÃ­do com sucesso");
        }

        [HttpGet("{id}/available-tickets")]
        public async Task<IActionResult> GetAvailableTicketsCount(Guid id)
        {
            var count = await _eventService.GetAvailableTicketsCountAsync(id);
            return HandleSuccess(new { availableTickets = count });
        }
    }
}