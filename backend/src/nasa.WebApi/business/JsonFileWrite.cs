using System.Text.Json;
using nasa.Core.Models.GetAsteroids;

namespace nasa.WebApi.business;

public class JsonFileWrite
{
    private readonly NasaAsteroidResponse? _nasaAsteroidResponse;

    public JsonFileWrite(NasaAsteroidResponse? nasaAsteroidResponse)
    {
        _nasaAsteroidResponse = nasaAsteroidResponse;
    }

    public async Task DataWriteInJson()
    {
        if (_nasaAsteroidResponse == null)
        {
            throw new InvalidOperationException("No data to write.");
        }

        var options = new JsonSerializerOptions
        {
            WriteIndented = true
        };

        const string filePath = "nasa_asteroid_data.json";

        var jsonData = JsonSerializer.Serialize(_nasaAsteroidResponse, options);

        await File.WriteAllTextAsync(filePath, jsonData);
    }
}