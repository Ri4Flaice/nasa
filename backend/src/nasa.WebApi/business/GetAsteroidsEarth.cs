using System.Text.Json;
using nasa.Core.Models.GetAsteroidsEarth;

namespace nasa.WebApi.business;

public class GetAsteroidsEarth
{
    private readonly HttpClient _httpClient;
    private readonly string _apiUrl;
    private readonly string _startDate;
    private readonly string? _endDate;

    public GetAsteroidsEarth(HttpClient httpClient, string apiUrl, string startDate, string? endDate)
    {
        _httpClient = httpClient;
        _apiUrl = apiUrl;
        _startDate = startDate;
        _endDate = endDate;
    }

    public async Task<NasaAsteroidResponse?> GetObjects()
    {
        try
        {
            var start = DateTime.Parse(_startDate);
            if (_endDate != null)
            {
                var end = DateTime.Parse(_endDate);
                if ((end - start).TotalDays > 7)
                {
                    throw new Exception("The date range cannot exceed 7 days.");
                }
            }

            var response = await _httpClient.GetAsync(_apiUrl);

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Error receiving data: {response.ReasonPhrase}");

            var jsonResponse = await response.Content.ReadAsStringAsync();

            var asteroidsData = JsonSerializer.Deserialize<NasaAsteroidResponse>(jsonResponse);

            return asteroidsData;
        }
        catch (Exception ex)
        {
            throw new Exception($"An error has occurred: {ex.Message}");
        }
    }
}