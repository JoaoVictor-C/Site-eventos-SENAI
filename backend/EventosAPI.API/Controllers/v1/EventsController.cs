using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Interfaces;
using System.Security.Claims;

namespace EventosAPI.API.Controllers.v1
{
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
            try
            {
                var events = await _eventService.GetAllAsync();
                return HandleSuccess(events);
            }
            catch (Exception ex)
            {
                return HandleError(ex.Message);
            }
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveEvents()
        {
            try
            {
                var events = await _eventService.GetActiveEventsAsync();
                return HandleSuccess(events);
            }
            catch (Exception ex)
            {
                return HandleError(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            try
            {
                var @event = await _eventService.GetByIdAsync(id);
                if (@event == null)
                    return HandleError("Evento não encontrado", 404);

                return HandleSuccess(@event);
            }
            catch (Exception ex)
            {
                return HandleError(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("my-events")]
        public async Task<IActionResult> GetMyEvents()
        {
            try
            {
                var organizerId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var events = await _eventService.GetEventsByOrganizerAsync(organizerId);
                return HandleSuccess(events);
            }
            catch (Exception ex)
            {
                return HandleError(ex.Message);
            }
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEventDto createEventDto)
        {
            try
            {
                var organizerId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
                var @event = await _eventService.CreateAsync(createEventDto, organizerId);
                return HandleSuccess(@event, "Evento criado com sucesso");
            }
            catch (Exception ex)
            {
                return HandleError(ex.Message);
            }
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEventDto updateEventDto)
        {
            try
            {
                await _eventService.UpdateAsync(id, updateEventDto);
                return HandleSuccess(message: "Evento atualizado com sucesso");
            }
            catch (Exception ex)
            {
                return HandleError(ex.Message);
            }
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _eventService.DeleteAsync(id);
                return HandleSuccess(message: "Evento deletado com sucesso");
            }
            catch (Exception ex)
            {
                return HandleError(ex.Message);
            }
        }

        [HttpGet("{id}/available-tickets")]
        public async Task<IActionResult> GetAvailableTicketsCount(Guid id)
        {
            try
            {
                var count = await _eventService.GetAvailableTicketsCountAsync(id);
                return HandleSuccess(new { availableTickets = count });
            }
            catch (Exception ex)
            {
                return HandleError(ex.Message);
            }
        }
    }
}
