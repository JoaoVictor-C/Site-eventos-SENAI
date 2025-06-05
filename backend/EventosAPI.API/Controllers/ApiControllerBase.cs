using Microsoft.AspNetCore.Mvc;

namespace EventosAPI.API.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public abstract class ApiControllerBase : ControllerBase
    {
        protected IActionResult HandleSuccess(object data = null, string message = null)
        {
            var response = new
            {
                data,
                message
            };

            return Ok(response);
        }

        protected IActionResult HandleError(string message, int statusCode = 400)
        {
            var response = new
            {
                error = true,
                message
            };

            return StatusCode(statusCode, response);
        }
    }
}
