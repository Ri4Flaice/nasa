namespace nasa.Core.Models;

public class AsteroidSolarSystemResponse
{
    public string object_name { get; set; }
    public string q_au_1 { get; set; } 
    public string q_au_2 { get; set; }
    public string moid_au { get; set; }
    public string e { get; set; }
    public string i_deg { get; set; }
    public string w_deg { get; set; }
    public string node_deg { get; set; }
}