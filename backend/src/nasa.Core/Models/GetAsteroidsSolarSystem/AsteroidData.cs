namespace nasa.Core.Models.GetAsteroidsSolarSystem;

public class AsteroidData
{
    public string? ObjectName { get; set; }
    public double PerihelionDistanceKm { get; set; }
    public double AphelionDistanceKm { get; set; }
    public double MinimumOrbitIntersectionDistanceKm { get; set; }
    public double Eccentricity { get; set; }
    public double InclinationDegrees { get; set; }
    public double ArgumentOfPeriapsisDegrees { get; set; }
    public double AscendingNodeDegrees { get; set; }

    public List<OrbitCoordinate> OrbitCoordinates { get; set; } = [];

    public void CalculateOrbit(int points = 50)
    {
        OrbitCoordinates = [];

        var semiMajorAxis = (PerihelionDistanceKm + AphelionDistanceKm) / 2;
        var semiMinorAxis = semiMajorAxis * Math.Sqrt(1 - Math.Pow(Eccentricity, 2));

        var inclinationRadians = InclinationDegrees * Math.PI / 180;

        for (var i = 0; i < points; i++)
        {
            var angle = 2 * Math.PI * i / points;
            var x = semiMajorAxis * Math.Cos(angle);
            var y = semiMinorAxis * Math.Sin(angle);
            var z = y * Math.Sin(inclinationRadians);

            OrbitCoordinates.Add(new OrbitCoordinate { X = x, Y = y, Z = z });
        }
    }
}