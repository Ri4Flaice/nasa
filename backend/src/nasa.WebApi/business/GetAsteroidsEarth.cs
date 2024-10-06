using System.Globalization;
using System.Text.Json;

using nasa.Core.Models.GetAsteroidsEarth;
using nasa.Core.Models.GetAsteroidsSolarSystem;

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

            if (asteroidsData == null) return asteroidsData;

            foreach (var neObjects in asteroidsData.near_earth_objects.Values)
            {
                foreach (var asteroid in neObjects)
                {
                    if (asteroid.close_approach_data.Count == 0) continue;

                    var closeApproach = asteroid.close_approach_data.First();

                    if (!double.TryParse(closeApproach.relative_velocity.kilometers_per_second, NumberStyles.Any, CultureInfo.InvariantCulture, out var velocityMps))
                        throw new FormatException($"Unable to parse velocity: {closeApproach.relative_velocity.kilometers_per_second}");
                    
                    velocityMps *= 1000;

                    if (!double.TryParse(closeApproach.miss_distance.kilometers, NumberStyles.Any, CultureInfo.InvariantCulture, out var missDistance))
                        throw new FormatException($"Unable to parse miss distance: {closeApproach.miss_distance.kilometers}");

                    missDistance *= 1000;

                    var closeApproachDate = DateTime.Parse(closeApproach.close_approach_date);

                    var timeToApproach = (closeApproachDate - DateTime.UtcNow).TotalSeconds;

                    for (var i = 0; i < 50; i++)
                    {
                        var timeOffset = timeToApproach + i * 60;
                        var angle = (Math.PI / 180) * (timeOffset / 60);

                        var x = missDistance * Math.Cos(angle);
                        var y = CalculateY(angle, missDistance);
                        var z = CalculateZ(angle, missDistance);

                        asteroid.OrbitCoordinates.Add(new OrbitCoordinate { X = x, Y = y, Z = z });
                    }
                }
            }

            return asteroidsData;
        }
        catch (Exception ex)
        {
            throw new Exception($"An error has occurred: {ex.Message}");
        }
    }
    
    private static double CalculateY(double angle, double radius)
    {
        return radius * Math.Sin(angle);
    }

    private static double CalculateZ(double angle, double radius)
    {
        return radius * Math.Cos(angle) * 0.5;
    }
}