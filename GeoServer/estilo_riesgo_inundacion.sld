<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0" 
    xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" 
    xmlns="http://www.opengis.net/sld" 
    xmlns:ogc="http://www.opengis.net/ogc" 
    xmlns:xlink="http://www.w3.org/1999/xlink" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <Name>Riesgo Inundacion</Name>
    <UserStyle>
      <Title>Mapa de Frecuencia (Zonas No Aptas)</Title>
      <FeatureTypeStyle>
        <Rule>
          <RasterSymbolizer>
            <Opacity>1.0</Opacity>
            <ColorMap>
              <!-- 0 = seguro / sin datos: transparente -->
              <ColorMapEntry color="#FFFFFF" quantity="0" opacity="0" label="Seguro"/>

              <!-- 1-20%: riesgo bajo -->
              <ColorMapEntry color="#FFF3B0" quantity="20" opacity="0.4" label="Riesgo Bajo"/>

              <!-- 21-40%: riesgo medio -->
              <ColorMapEntry color="#FF9800" quantity="40" opacity="0.6" label="Riesgo Medio"/>

              <!-- 41-60%: riesgo alto -->
              <ColorMapEntry color="#FF3B30" quantity="60" opacity="0.75" label="Riesgo Alto"/>

              <!-- 61-100%: zona crítica -->
              <ColorMapEntry color="#7F0000" quantity="100" opacity="0.9" label="Zona Critica"/>
            </ColorMap>
          </RasterSymbolizer>
        </Rule>
      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>