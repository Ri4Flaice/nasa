using System.Globalization;
using System.Text.Json;

using nasa.Core.Models.GetAsteroidsSolarSystem;

namespace nasa.WebApi.business;

public class GetAsteroidsSolarSystem
{
    private readonly HttpClient _httpClient;
    private readonly string _apiUrl;

    public GetAsteroidsSolarSystem(HttpClient httpClient, string apiUrl)
    {
        _httpClient = httpClient;
        _apiUrl = apiUrl;
    }

    public async Task<List<AsteroidData>> GetObjects()
    {
        var response = await _httpClient.GetAsync(_apiUrl);
        response.EnsureSuccessStatusCode();

        var jsonResponse = await response.Content.ReadAsStringAsync();

        var asteroidsData = JsonSerializer.Deserialize<List<AsteroidSolarSystemResponse>>(jsonResponse);

        if (asteroidsData == null) throw new Exception("asteroids is null");

        var asteroidModels = asteroidsData.Select(asteroid => new AsteroidData
        {
            ObjectName = asteroid.object_name,
            PerihelionDistanceKm = ConvertAuToKm(double.Parse(asteroid.q_au_1, CultureInfo.InvariantCulture)),
            AphelionDistanceKm = ConvertAuToKm(double.Parse(asteroid.q_au_2, CultureInfo.InvariantCulture)),
            MinimumOrbitIntersectionDistanceKm = ConvertAuToKm(double.Parse(asteroid.moid_au, CultureInfo.InvariantCulture)),
            Eccentricity = double.Parse(asteroid.e, CultureInfo.InvariantCulture),
            InclinationDegrees = double.Parse(asteroid.i_deg, CultureInfo.InvariantCulture),
            ArgumentOfPeriapsisDegrees = double.Parse(asteroid.w_deg, CultureInfo.InvariantCulture),
            AscendingNodeDegrees = double.Parse(asteroid.node_deg, CultureInfo.InvariantCulture)
        }).ToList();
        
        foreach (var asteroid in asteroidModels)
        {
            asteroid.CalculateOrbit();
        }

        return asteroidModels;
    }

    private static double ConvertAuToKm(double au)
    {
        return au * 149597870.7;
    }
}