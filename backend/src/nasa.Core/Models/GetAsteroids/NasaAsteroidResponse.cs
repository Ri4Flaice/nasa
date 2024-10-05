namespace nasa.Core.Models.GetAsteroids;

public class NasaAsteroidResponse
{
    public Dictionary<string, List<NearEarthObject>> near_earth_objects { get; set; }
}