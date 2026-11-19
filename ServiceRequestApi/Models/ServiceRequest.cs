namespace ServiceRequestApi.Models
{
    public class ServiceRequest
    {
        public int Id { get; set; }
        public string RequestCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string AssetTag { get; set; } = string.Empty;
        public string BusinessImpact { get; set; } = string.Empty;
        public string Urgency { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string TargetDate { get; set; } = string.Empty;
        public string Status { get; set; } = "SUBMITTED";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}