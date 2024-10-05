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
}