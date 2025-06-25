using System.Threading.Tasks;
using EventosAPI.API.Controllers;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventosAPI.API.Controllers.v1
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize]
    public class AnalyticsController : ApiControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly IEventRoleService _eventRoleService;

        public AnalyticsController(IAnalyticsService analyticsService, IEventRoleService eventRoleService)
        {
            _analyticsService = analyticsService;
            _eventRoleService = eventRoleService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(AnalyticsData), 200)]
        public async Task<IActionResult> GetAnalytics([FromQuery] string? eventId = null)
        {
            if (!string.IsNullOrEmpty(eventId))
            {
                var currentUserId = GetCurrentUserId();
                if (!await _eventRoleService.HasEventPermissionAsync(Guid.Parse(eventId), currentUserId, EventosAPI.Domain.Enums.EventRoleType.ViewReports))
                    return HandleError("Forbidden", 403);
            }
            var data = await _analyticsService.GetAnalyticsDataAsync(eventId);
            return HandleSuccess(data);
        }
    }
}