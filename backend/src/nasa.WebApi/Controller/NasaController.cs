using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using nasa.Core.Models.GetAsteroids;
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

    [HttpGet("getAsteroids")]
    public async Task<NasaAsteroidResponse?> GetAsteroids(string startDate, string? endDate)
    {
        var apiUrl =
            $"https://api.nasa.gov/neo/rest/v1/feed?start_date={startDate}&end_date={endDate}&api_key={_jsonSettings.ApiKey}";

        var getSmallObjectsConstructor = new GetAsteroidsObjects(_httpClient, apiUrl, startDate, endDate);
        var asteroidsData = await getSmallObjectsConstructor.GetObjects();

        var jsonFileWriteConstructor = new JsonFileWrite(asteroidsData);
        await jsonFileWriteConstructor.DataWriteInJson();

        return asteroidsData;
    }
}