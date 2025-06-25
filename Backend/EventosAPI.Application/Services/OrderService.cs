using AutoMapper;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Exceptions;
using EventosAPI.Application.Interfaces;
using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Enums;
using EventosAPI.Domain.Interfaces.Repositories;

namespace EventosAPI.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IBatchRepository _batchRepository;
        private readonly ITicketService _ticketService;
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public OrderService(
            IOrderRepository orderRepository,
            IBatchRepository batchRepository,
            ITicketService ticketService,
            IUserRepository userRepository,
            IMapper mapper)
        {
            _orderRepository = orderRepository;
            _batchRepository = batchRepository;
            _ticketService = ticketService;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        public async Task<OrderDto> GetByIdAsync(Guid id)
        {
            var order = await _orderRepository.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(Order), id);
            return _mapper.Map<OrderDto>(order);
        }

        public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(Guid userId)
        {
            var orders = await _orderRepository.GetUserOrdersAsync(userId);
            return _mapper.Map<IEnumerable<OrderDto>>(orders);
        }

        public async Task<OrderDto> CreateOrderAsync(CreateOrderDto createOrderDto)
        {
            var batch = await _batchRepository.GetByIdAsync(createOrderDto.BatchId)
                ?? throw new NotFoundException(nameof(Batch), createOrderDto.BatchId);

            var user = await _userRepository.GetByIdAsync(createOrderDto.UserId)
                ?? throw new NotFoundException(nameof(User), createOrderDto.UserId);

            if (!batch.IsActive)
                throw new BusinessRuleException("This batch is not active");

            if (batch.Stock < createOrderDto.Quantity)
                throw new BusinessRuleException("Not enough tickets available in this batch");

            if (batch.EndDate < DateTime.UtcNow)
                throw new BusinessRuleException("This batch has ended");

            var order = new Order
            {
                UserId = createOrderDto.UserId,
                User = user,
                PaymentMethod = createOrderDto.PaymentMethod,
                Quantity = createOrderDto.Quantity,
                Total = batch.UnitPrice * createOrderDto.Quantity,
                Event = batch.Event,
                EventId = batch.EventId,
            };

            await _orderRepository.CreateAsync(order);

            // Create tickets for the order
            foreach (var ticketRequest in createOrderDto.TicketRequests)
            {
                var createTicketDto = new CreateTicketDto
                {
                    BatchId = batch.Id,
                    OrderId = order.Id,
                    UserId = createOrderDto.UserId,
                    Type = ticketRequest.Type,
                    DocumentNumber = ticketRequest.DocumentNumber
                };

                await _ticketService.CreateTicketAsync(createTicketDto, order.UserId);
            }

            // Update batch stock
            batch.Stock -= createOrderDto.Quantity;
            await _batchRepository.UpdateAsync(batch);

            // Check if batch is fully used and needs to be deactivated
            if (batch.Stock == 0)
            {
                batch.IsActive = false;
                await _batchRepository.UpdateAsync(batch);

                // Activate next batch if available
                await ActivateNextBatchAsync(batch.EventId);
            }

            var createdOrder = await _orderRepository.GetByIdAsync(order.Id)
                ?? throw new BusinessRuleException("Failed to retrieve created order");

            return _mapper.Map<OrderDto>(createdOrder);
        }

        public async Task<OrderDto> UpdateOrderAsync(Guid id, UpdateOrderDto updateOrderDto)
        {
            var order = await _orderRepository.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(Order), id);

            // Validate status transition
            if (order.Status != updateOrderDto.Status)
            {
                switch (updateOrderDto.Status)
                {
                    case OrderStatus.Paid when !order.CanBePaid:
                        throw new BusinessRuleException("Order cannot be marked as paid.");
                    case OrderStatus.Canceled when order.Status == OrderStatus.Paid:
                        throw new BusinessRuleException("Cannot cancel a paid order.");
                    case OrderStatus.Expired when !order.IsPending && !order.IsReserved:
                        throw new BusinessRuleException("Only pending or reserved orders can expire.");
                }

                order.Status = updateOrderDto.Status;
            }

            // Update payment method if provided and valid
            if (updateOrderDto.PaymentMethod.HasValue)
            {
                if (order.Status == OrderStatus.Paid)
                    throw new BusinessRuleException("Cannot change payment method of a paid order.");
                
                order.PaymentMethod = updateOrderDto.PaymentMethod.Value;
            }

            await _orderRepository.UpdateAsync(order);

            var updatedOrder = await _orderRepository.GetByIdAsync(id)
                ?? throw new BusinessRuleException("Failed to retrieve updated order");

            return _mapper.Map<OrderDto>(updatedOrder);
        }

        public async Task<bool> ValidateOrderAsync(Guid orderId, Guid validatedByUserId)
        {
            var order = await _orderRepository.GetByIdAsync(orderId)
                ?? throw new NotFoundException(nameof(Order), orderId);

            var validator = await _userRepository.GetByIdAsync(validatedByUserId)
                ?? throw new NotFoundException(nameof(User), validatedByUserId);

            if (!order.CanBePaid)
                throw new BusinessRuleException("Order cannot be validated. It must be in pending or reserved status and not expired.");

            // For physical payments, check if the order is not expired
            if (order.PaymentMethod is PaymentMethod.Cash or PaymentMethod.Other)
            {
                if (order.OrderDate.AddHours(24) < DateTime.UtcNow)
                {
                    order.Status = OrderStatus.Expired;
                    await _orderRepository.UpdateAsync(order);
                    throw new BusinessRuleException("Order has expired. The 24-hour payment window has passed.");
                }
            }

            order.Status = OrderStatus.Paid;
            order.ValidatedByUserId = validatedByUserId;
            order.ValidatedByUser = validator;

            await _orderRepository.UpdateAsync(order);
            return true;
        }

        public async Task<IEnumerable<OrderSummaryDto>> GetEventOrdersAsync(Guid eventId)
        {
            var orders = await _orderRepository.GetEventOrdersAsync(eventId);
            return orders.Select(o => new OrderSummaryDto
            {
                Id = o.Id,
                EventName = o.Event.Name,
                EventDate = o.Event.EventDate,
                OrderDate = o.OrderDate,
                Total = o.Total,
                Quantity = o.Tickets.Count(),
                Status = o.Status,
                PaymentStatus = o.Status.ToString(),
                ExpiresAt = o.Status == OrderStatus.Reserved ? o.OrderDate.AddHours(24) : null
            });
        }

        private async Task ActivateNextBatchAsync(Guid eventId)
        {
            var batches = await _batchRepository.GetEventBatchesAsync(eventId);
            var orderedBatches = batches
                .OrderBy(b => b.StartDate)
                .Where(b => !b.IsActive && b.Stock > 0 && b.EndDate > DateTime.UtcNow)
                .ToList();

            if (orderedBatches.Any())
            {
                var nextBatch = orderedBatches.First();
                nextBatch.IsActive = true;
                await _batchRepository.UpdateAsync(nextBatch);
            }
        }

        private string GetPaymentStatus(Order order)
        {
            if (order.Status == OrderStatus.Paid)
                return "Paid";
            if (order.Status == OrderStatus.Canceled)
                return "Canceled";
            if (order.Status == OrderStatus.Expired)
                return "Expired";
            if (order.Status == OrderStatus.Pending)
            {
                var expirationTime = order.OrderDate.AddHours(24);
                if (DateTime.UtcNow > expirationTime)
                    return "Expired";
                return $"Pending (Expires in {(expirationTime - DateTime.UtcNow).TotalHours:F1} hours)";
            }
            return "Unknown";
        }
    }
}
