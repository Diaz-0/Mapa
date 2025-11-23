

var puntosDeInteresGeoJSON = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          -91.53529405031605,
          17.80180845982987
        ],
        "type": "Point"
      }
    },
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          -91.42542963696859,
          17.475272527776383
        ],
        "type": "Point"
      }
    },
    {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "coordinates": [
          -91.76479051704675,
          17.741362939102842
        ],
        "type": "Point"
      }
    }
  ]
}

L.geoJSON(puntosDeInteresGeoJSON, {}).addTo(mapa)