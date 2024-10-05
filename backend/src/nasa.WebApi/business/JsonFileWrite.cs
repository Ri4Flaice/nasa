using System.Text.Json;
using nasa.Core.Models.GetAsteroidsEarth;
using nasa.Core.Models.GetAsteroidsSolarSystem;

namespace nasa.WebApi.business;

public class JsonFileWrite
{
    private readonly NasaAsteroidResponse? _asteroidsEarth;
    private readonly List<AsteroidData>? _asteroidsSolarSystem;

    public JsonFileWrite(NasaAsteroidResponse? asteroidsEarth, List<AsteroidData>? asteroidsSolarSystem)
    {
        _asteroidsEarth = asteroidsEarth;
        _asteroidsSolarSystem = asteroidsSolarSystem;
    }

    public async Task AsteroidsEarthWriteInJson()
    {
        if (_asteroidsEarth == null)
            throw new InvalidOperationException("No data to write.");

        var options = new JsonSerializerOptions
        {
            WriteIndented = true
        };

        const string filePath = "nasa_asteroid_earth.json";

        var jsonData = JsonSerializer.Serialize(_asteroidsEarth, options);

        await File.WriteAllTextAsync(filePath, jsonData);
    }

    public async Task AsteroidsSolarSystemWriteInJson()
    {
        if (_asteroidsSolarSystem == null)
            throw new InvalidOperationException("No data to write.");
        
        var options = new JsonSerializerOptions
        {
            WriteIndented = true
        };
        
        const string filePath = "nasa_asteroid_solar_system.json";

        var jsonData = JsonSerializer.Serialize(_asteroidsSolarSystem, options);

        await File.WriteAllTextAsync(filePath, jsonData);
    }
}