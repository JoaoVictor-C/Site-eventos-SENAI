using System.Collections.Generic;

namespace EventosAPI.Application.DTOs
{
    public class ChartDataPoint
    {
        public required string Label { get; set; }
        public decimal Value { get; set; }
    }

    public class EventSpecificAnalytics
    {
        public decimal TotalSales { get; set; }
        public int TicketsSold { get; set; }
        public required List<ChartDataPoint> SalesOverTime { get; set; }
        public required List<ChartDataPoint> TicketsByBatchChartData { get; set; }
        public required List<ChartDataPoint> RevenueByBatchChartData { get; set; }
        public required KeyStats KeyStats { get; set; }
    }

    public class KeyStats
    {
        public int TotalBatches { get; set; }
        public int TotalCapacity { get; set; }
        public decimal PercentageSold { get; set; }
    }

    public class AnalyticsData
    {
        public decimal TotalSales { get; set; }
        public int TicketsSold { get; set; }
        public int ActiveEventsCount { get; set; }
        public int RegisteredUsersCount { get; set; }
        public required List<ChartDataPoint> SalesByEvent { get; set; }
        public required List<ChartDataPoint> TicketsSoldByEvent { get; set; }
        public EventSpecificAnalytics? EventSpecific { get; set; }
    }
}