using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using nasa.Core.Models.GetAsteroidsEarth;
using nasa.Core.Models.GetAsteroidsSolarSystem;
using nasa.Core.Models.Json;
using nasa.WebApi.business;

namespace nasa.WebApi.Controller;

[ApiController]
[Route("api/[controller]/")]
public class NasaController
{
    private readonly HttpClient _httpClient;
    private readonly JsonSettings _jsonSettings;

    public NasaController(HttpClient httpClient, IOptions<JsonSettings> jsonSettings)
    {
        _httpClient = httpClient;
        _jsonSettings = jsonSettings.Value;
    }

    [HttpGet("getAsteroidsEarth")]
    public async Task<NasaAsteroidResponse?> GetAsteroidsEarth(string startDate, string? endDate)
    {
        var apiUrl =
            $"https://api.nasa.gov/neo/rest/v1/feed?start_date={startDate}&end_date={endDate}&api_key={_jsonSettings.ApiKey}";

        var getAsteroidsEarthConstructor = new GetAsteroidsEarth(_httpClient, apiUrl, startDate, endDate);
        var asteroidsData = await getAsteroidsEarthConstructor.GetObjects();

        var jsonFileWriteConstructor = new JsonFileWrite(asteroidsData, null);
        await jsonFileWriteConstructor.AsteroidsEarthWriteInJson();

        return asteroidsData;
    }

    [HttpGet("getAsteroidsSolarSystem")]
    public async Task<List<AsteroidData>> GetAsteroidsSolarSystem()
    {
        const string apiUrl = "https://data.nasa.gov/resource/b67r-rgxc.json";

        var getAsteroidSolarSystemConstructor = new GetAsteroidsSolarSystem(_httpClient, apiUrl);
        var asteroidsData = await getAsteroidSolarSystemConstructor.GetObjects();

        var jsonFileWriteConstructor = new JsonFileWrite(null, asteroidsData);
        await jsonFileWriteConstructor.AsteroidsSolarSystemWriteInJson();
        
        return asteroidsData;
    }
}