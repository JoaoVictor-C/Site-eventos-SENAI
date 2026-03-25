using AutoMapper;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Exceptions;
using EventosAPI.Application.Interfaces;
using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Enums;
using EventosAPI.Domain.Interfaces.Repositories;
using UnauthorizedAccessException = EventosAPI.Application.Exceptions.UnauthorizedAccessException;

namespace EventosAPI.Application.Services
{
    public class TicketService : ITicketService
    {
        private readonly ITicketRepository _ticketRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IBatchRepository _batchRepository;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public TicketService(
            ITicketRepository ticketRepository,
            IOrderRepository orderRepository,
            IBatchRepository batchRepository,
            IUserRepository userRepository,
            IMapper mapper)
        {
            _ticketRepository = ticketRepository;
            _orderRepository = orderRepository;
            _batchRepository = batchRepository;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<TicketDto>> GetTicketsByUserAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId)
                ?? throw new NotFoundException(nameof(User), userId);

            var tickets = await _ticketRepository.GetByFilterAsync(t => t.UserId == userId);
            return _mapper.Map<IEnumerable<TicketDto>>(tickets);
        }

        public async Task<IEnumerable<TicketDto>> GetTicketsByEventAsync(Guid eventId)
        {
            var tickets = await _ticketRepository.GetByFilterAsync(t => t.Batch.EventId == eventId);
            return _mapper.Map<IEnumerable<TicketDto>>(tickets);
        }

        public async Task<OrderDto?> GetOrderAsync(Guid orderId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId);
            return _mapper.Map<OrderDto>(order);
        }

        public async Task<TicketReservationResponseDto> ReserveTicketsAsync(TicketReservationDto reservationDto, Guid userId)
        {
            var batch = await _batchRepository.GetByIdAsync(reservationDto.BatchId)
                ?? throw new NotFoundException(nameof(Batch), reservationDto.BatchId);

            var user = await _userRepository.GetByIdAsync(userId)
                ?? throw new NotFoundException(nameof(User), userId);

            if (!batch.IsActive)
                throw new BusinessRuleException("This ticket batch is not active");

            if (batch.Stock < reservationDto.Quantity)
                throw new BusinessRuleException("Not enough tickets available in this batch");

            if (!reservationDto.AcceptTerms)
                throw new ValidationException(new[] { "You must accept the terms and conditions" });

            // Create order with pending status
            var order = new Order
            {
                UserId = userId,
                User = user,
                Quantity = reservationDto.Quantity,
                Total = batch.UnitPrice * reservationDto.Quantity,
                Status = OrderStatus.Pending,
                OrderDate = DateTime.UtcNow,
                Event = batch.Event,
                EventId = batch.EventId,
            };

            // Save order
            await _orderRepository.CreateAsync(order);

            // Create tickets
            var tickets = new List<Ticket>();
            for (int i = 0; i < reservationDto.Quantity; i++)
            {
                var ticket = new Ticket
                {
                    OrderId = order.Id,
                    Order = order,
                    BatchId = batch.Id,
                    Batch = batch,
                    UserId = userId,
                    User = user,
                    Status = TicketStatus.Pending,
                    Type = reservationDto.Type,
                    Price = batch.UnitPrice,
                    IsActive = true,
                    QRCode = GenerateQRCode(order.Id, i)
                };

                tickets.Add(ticket);
                await _ticketRepository.CreateAsync(ticket);
            }

            // Update batch stock
            batch.Stock -= reservationDto.Quantity;
            await _batchRepository.UpdateAsync(batch);

            // Create response
            return new TicketReservationResponseDto
            {
                OrderId = order.Id,
                TotalAmount = order.Total,
                ReservationExpiration = DateTime.UtcNow.AddHours(24),
                PaymentInstructions = GetPaymentInstructions(batch.Event, order),
                Tickets = _mapper.Map<IEnumerable<TicketDto>>(tickets)
            };
        }

        public async Task ValidateTicketPaymentAsync(TicketValidationDto validationDto, Guid validatorId)
        {
            var order = await _orderRepository.GetByIdAsync(validationDto.OrderId)
                ?? throw new NotFoundException(nameof(Order), validationDto.OrderId);

            if (!order.CanBePaid)
                throw new BusinessRuleException("This order cannot be paid");

            var validator = await _userRepository.GetByIdAsync(validatorId)
                ?? throw new NotFoundException(nameof(User), validatorId);

            // Mark order as paid
            order.MarkAsPaid(validationDto.PaymentMethod);
            order.ValidatedByUserId = validatorId;
            order.ValidatedByUser = validator;

            // Update order
            await _orderRepository.UpdateAsync(order);
        }

        public async Task CancelReservationAsync(Guid orderId, Guid userId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId)
                ?? throw new NotFoundException(nameof(Order), orderId);

            if (order.UserId != userId)
                throw new UnauthorizedAccessException("You can only cancel your own reservations");

            if (!order.IsPending)
                throw new BusinessRuleException("Only pending orders can be cancelled");

            // Cancel order and return tickets to stock
            order.Cancel(true);
            await _orderRepository.UpdateAsync(order);
        }

        public async Task<TicketDto> CreateTicketAsync(CreateTicketDto createTicketDto, Guid userId)
        {
            var ticket = _mapper.Map<Ticket>(createTicketDto);
            await _ticketRepository.CreateAsync(ticket);
            return _mapper.Map<TicketDto>(ticket);
        }

        public async Task<bool> ValidateTicketAsync(Guid ticketId, Guid validatorId)
        {
            var ticket = await _ticketRepository.GetByIdAsync(ticketId)
                ?? throw new NotFoundException(nameof(Ticket), ticketId);

            if (!ticket.IsValid)
                return false;

            ticket.MarkAsUsed();
            await _ticketRepository.UpdateAsync(ticket);
            return true;
        }

        public async Task<TicketDto> GetTicketByIdAsync(Guid ticketId)
        {
            var ticket = await _ticketRepository.GetByIdAsync(ticketId)
                ?? throw new NotFoundException(nameof(Ticket), ticketId);

            return _mapper.Map<TicketDto>(ticket);
        }

        public async Task<IEnumerable<OrderDto>> GetAllOrdersAsync()
        {
            var orders = await _orderRepository.GetAllAsync();
            return _mapper.Map<IEnumerable<OrderDto>>(orders);
        }

        public async Task<IEnumerable<OrderDto>> GetOrdersByEventAsync(Guid eventId)
        {
            var orders = await _orderRepository.GetEventOrdersAsync(eventId);
            return _mapper.Map<IEnumerable<OrderDto>>(orders);
        }

        private string GenerateQRCode(Guid orderId, int ticketNumber)
        {
            // In a real application, you would use a proper QR code generation library
            return $"{orderId}-{ticketNumber}-{DateTime.UtcNow.Ticks}";
        }

        private string GetPaymentInstructions(Event @event, Order order)
        {
            return $@"Please complete your payment at any of our physical locations within 24 hours.
Payment Details:
- Order ID: {order.Id}
- Total Amount: {order.Total:C}
- Event: {@event.Name}
- Expires: {DateTime.UtcNow.AddHours(24):g}

Accepted Payment Methods:
- Cash
- PIX
- Debit Card

Please bring a valid ID to complete the payment.
After payment, your tickets will be validated by our staff and immediately available in your account.";
        }
    }
}
