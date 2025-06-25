using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Interfaces;
using EventosAPI.Domain.Interfaces.Repositories;
using EventosAPI.Domain.Entities;

namespace EventosAPI.Application.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IEventRepository _eventRepository;
        private readonly ITicketRepository _ticketRepository;
        private readonly IUserRepository _userRepository;

        public AnalyticsService(
            IEventRepository eventRepository,
            ITicketRepository ticketRepository,
            IUserRepository userRepository)
        {
            _eventRepository = eventRepository;
            _ticketRepository = ticketRepository;
            _userRepository = userRepository;
        }

        public async Task<AnalyticsData> GetAnalyticsDataAsync(string? eventId = null)
        {
            var activeEvents = await _eventRepository.GetByFilterAsync(e => e.IsActive && !e.IsDeleted);
            var paidTickets = await GetPaidTicketsWithDataAsync();
            var users = await _userRepository.GetAllAsync();

            var analyticsData = new AnalyticsData
            {
                ActiveEventsCount = activeEvents.Count(),
                RegisteredUsersCount = users.Count(),
                TicketsSold = paidTickets.Count(),
                TotalSales = paidTickets.Sum(t => t.Price),
                SalesByEvent = GetSalesByEvent(paidTickets),
                TicketsSoldByEvent = GetTicketsSoldByEvent(paidTickets)
            };

            if (!string.IsNullOrEmpty(eventId))
            {
                analyticsData.EventSpecific = await GetEventSpecificAnalyticsAsync(Guid.Parse(eventId));
            }

            return analyticsData;
        }

        private async Task<IEnumerable<Ticket>> GetPaidTicketsWithDataAsync()
        {
            return await _ticketRepository.GetByFilterAsync(t => t.Status == Domain.Enums.TicketStatus.Paid);
        }

        private List<ChartDataPoint> GetSalesByEvent(IEnumerable<Ticket> paidTickets)
        {
            return paidTickets
                .GroupBy(t => t.Batch.Event.Name)
                .Select(g => new ChartDataPoint
                {
                    Label = g.Key ?? "Unknown Event",
                    Value = g.Sum(t => t.Price)
                })
                .OrderByDescending(x => x.Value)
                .ToList();
        }

        private List<ChartDataPoint> GetTicketsSoldByEvent(IEnumerable<Ticket> paidTickets)
        {
            return paidTickets
                .GroupBy(t => t.Batch.Event.Name)
                .Select(g => new ChartDataPoint
                {
                    Label = g.Key ?? "Unknown Event",
                    Value = g.Count()
                })
                .OrderByDescending(x => x.Value)
                .ToList();
        }

        private async Task<EventSpecificAnalytics> GetEventSpecificAnalyticsAsync(Guid eventId)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(eventId);
            if (eventEntity == null)
                throw new ApplicationException("Event not found");

            var tickets = await _ticketRepository.GetByEventIdAsync(eventId);
            var paidTickets = tickets.Where(t => t.Status == Domain.Enums.TicketStatus.Paid).ToList();

            var salesByBatch = paidTickets
                .GroupBy(t => t.Batch.Name)
                .Select(g => new ChartDataPoint
                {
                    Label = g.Key ?? "Unknown Batch",
                    Value = g.Sum(t => t.Price)
                })
                .OrderByDescending(x => x.Value)
                .ToList();

            var ticketsByBatch = paidTickets
                .GroupBy(t => t.Batch.Name)
                .Select(g => new ChartDataPoint
                {
                    Label = g.Key ?? "Unknown Batch",
                    Value = g.Count()
                })
                .OrderByDescending(x => x.Value)
                .ToList();

            var salesOverTime = paidTickets
                .GroupBy(t => t.CreatedAt.Date)
                .Select(g => new ChartDataPoint
                {
                    Label = g.Key.ToString("yyyy-MM-dd"),
                    Value = g.Sum(t => t.Price)
                })
                .OrderBy(x => x.Label)
                .ToList();

            var totalCapacity = eventEntity.Batches?.Sum(b => b.TotalQuantity) ?? 0;
            var soldPercentage = totalCapacity > 0 
                ? (decimal)paidTickets.Count() / totalCapacity * 100 
                : 0;

            return new EventSpecificAnalytics
            {
                TotalSales = paidTickets.Sum(t => t.Price),
                TicketsSold = paidTickets.Count(),
                SalesOverTime = salesOverTime,
                RevenueByBatchChartData = salesByBatch,
                TicketsByBatchChartData = ticketsByBatch,
                KeyStats = new KeyStats
                {
                    TotalBatches = eventEntity.Batches?.Count ?? 0,
                    TotalCapacity = totalCapacity,
                    PercentageSold = Math.Round(soldPercentage, 2)
                }
            };
        }
    }
}