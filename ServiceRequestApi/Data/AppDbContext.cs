using Microsoft.EntityFrameworkCore;
using ServiceRequestApi.Models;

namespace ServiceRequestApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<ServiceRequest> ServiceRequests { get; set; }
    }
}