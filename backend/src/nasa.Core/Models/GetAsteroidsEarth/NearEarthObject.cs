namespace nasa.Core.Models.GetAsteroidsEarth;

public class NearEarthObject
{
    public string name { get; set; }
    public double absolute_magnitude_h { get; set; }
    public EstimatedDiameter estimated_diameter { get; set; }
    public List<CloseApproachData> close_approach_data { get; set; }
    public bool is_potentially_hazardous_asteroid { get; set; }
    public bool is_sentry_object { get; set; }
}