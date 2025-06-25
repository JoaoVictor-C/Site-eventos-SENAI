using System.Threading.Tasks;
using EventosAPI.Application.DTOs;

namespace EventosAPI.Application.Interfaces
{
    public interface IAnalyticsService
    {
        Task<AnalyticsData> GetAnalyticsDataAsync(string? eventId = null);
    }
}