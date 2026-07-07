namespace Skinet.API.Errors
{
    public class ApiErrorResponse(int StatusCode, string Message, string Detail)
    {
        public int StatusCode { get; set; } = StatusCode;
        public string? Details { get; set; } = Message;
        public string Message { get; set; } = Detail;
    }
}
