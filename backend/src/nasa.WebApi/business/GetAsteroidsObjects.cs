using System.Text.Json;
using nasa.Core.Models;
using nasa.Core.Models.GetAsteroids;

namespace nasa.WebApi.business;

public class GetAsteroidsObjects
{
    private readonly HttpClient _httpClient;
    private readonly string _apiUrl;
    private readonly string _startDate;
    private readonly string? _endDate;

    public GetAsteroidsObjects(HttpClient httpClient, string apiUrl, string startDate, string? endDate)
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
                    throw new Exception("Диапазон дат не может превышать 7 дней.");
                }
            }

            var response = await _httpClient.GetAsync(_apiUrl);

            if (!response.IsSuccessStatusCode)
                throw new Exception($"Ошибка при получении данных: {response.ReasonPhrase}");

            var jsonResponse = await response.Content.ReadAsStringAsync();

            var asteroidsData = JsonSerializer.Deserialize<NasaAsteroidResponse>(jsonResponse);

            return asteroidsData;
        }
        catch (Exception ex)
        {
            throw new Exception($"Произошла ошибка: {ex.Message}");
        }
    }
}