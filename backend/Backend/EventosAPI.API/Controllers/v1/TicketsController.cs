using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Interfaces;
using System.Security.Claims;

namespace EventosAPI.API.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class TicketsController : ApiControllerBase
    {
        private readonly ITicketService _ticketService;
        private readonly IUserService _userService;
        private readonly IEventService _eventService;

        public TicketsController(
            ITicketService ticketService, 
            IUserService userService,
            IEventService eventService)
        {
            _ticketService = ticketService;
            _userService = userService;
            _eventService = eventService;
        }

        [HttpGet("my-tickets")]
        [Authorize]
        public async Task<IActionResult> GetMyTickets()
        {
            var userId = GetCurrentUserId();
            var tickets = await _ticketService.GetTicketsByUserAsync(userId);
            return HandleSuccess(tickets);
        }

        [HttpGet("event/{eventId}")]
        [Authorize]
        public async Task<IActionResult> GetEventTickets(Guid eventId)
        {
            await ValidateEventAccess(eventId, _eventService, Domain.Enums.EventRoleType.ManageTickets);
            var tickets = await _ticketService.GetTicketsByEventAsync(eventId);
            return HandleSuccess(tickets);
        }

        [HttpPost("reserve")]
        [Authorize]
        public async Task<IActionResult> ReserveTickets([FromBody] TicketReservationDto reservationDto)
        {
            var userId = GetCurrentUserId();
            var response = await _ticketService.ReserveTicketsAsync(reservationDto, userId);
            return HandleSuccess(response, "Tickets reserved successfully", 201);
        }

        [HttpPost("{orderId}/validate")]
        [Authorize]
        public async Task<IActionResult> ValidateTicketPayment(Guid orderId, [FromBody] TicketValidationDto validationDto)
        {
            var validatorId = GetCurrentUserId();

            var order = await _ticketService.GetOrderAsync(orderId);
            if (order == null)
                return HandleError("Order not found", 404);
            await ValidateEventAccess(order.EventId, _eventService, Domain.Enums.EventRoleType.ManageTickets);
            await _ticketService.ValidateTicketPaymentAsync(validationDto, validatorId);
            return HandleSuccess<object>(null, "Ticket payment validated successfully");
        }

        [HttpGet("order/{orderId}")]
        [Authorize]
        public async Task<IActionResult> GetOrderStatus(Guid orderId)
        {
            var userId = GetCurrentUserId();
            var order = await _ticketService.GetOrderAsync(orderId);
            if (order == null)
                return HandleError("Order not found", 404);
            if (order.UserId != userId && !await _eventService.HasEventRoleAsync(order.EventId, userId, Domain.Enums.EventRoleType.ManageTickets))
                return HandleError("Forbidden", 403);
            return HandleSuccess(order);
        }

        [HttpPost("{orderId}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelReservation(Guid orderId)
        {
            var userId = GetCurrentUserId();
            await _ticketService.CancelReservationAsync(orderId, userId);
            return HandleSuccess<object>(null, "Reservation cancelled successfully");
        }

        [HttpGet("orders")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _ticketService.GetAllOrdersAsync();
            return HandleSuccess(orders);
        }

        [HttpGet("orders/{eventId}")]
        [Authorize]
        public async Task<IActionResult> GetOrdersByEvent(Guid eventId)
        {
            // If admin return all orders for the event
            if (IsCurrentUserAdmin())
            {
                var allOrders = await _ticketService.GetAllOrdersAsync();
                return HandleSuccess(allOrders);
            }
            await ValidateEventAccess(eventId, _eventService, Domain.Enums.EventRoleType.ManageTickets);
            var orders = await _ticketService.GetOrdersByEventAsync(eventId);
            return HandleSuccess(orders);
        }
    }
}
