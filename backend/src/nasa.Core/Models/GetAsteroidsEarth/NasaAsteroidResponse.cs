namespace nasa.Core.Models.GetAsteroidsEarth;

public class NasaAsteroidResponse
{
    public Dictionary<string, List<NearEarthObject>> near_earth_objects { get; set; }
}