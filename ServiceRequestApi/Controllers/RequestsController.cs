using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ServiceRequestApi.Data;
using ServiceRequestApi.Models;

namespace ServiceRequestApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RequestsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RequestsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServiceRequest>>> GetRequests()
        {
            return await _context.ServiceRequests
                .OrderByDescending(r => r.Id)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<ServiceRequest>> CreateRequest([FromBody] ServiceRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title) ||
                string.IsNullOrWhiteSpace(request.Description) ||
                string.IsNullOrWhiteSpace(request.Category))
            {
                return BadRequest(new { message = "Title, Description, and Category are required." });
            }

            request.Status = "SUBMITTED";
            request.CreatedAt = DateTime.UtcNow;

            _context.ServiceRequests.Add(request);
            await _context.SaveChangesAsync();

            request.RequestCode = $"SR-{1039 + request.Id}";
            await _context.SaveChangesAsync();

            return Ok(request);
        }
    }
}