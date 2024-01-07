$(document).ready(function(){
    
  // Cria o mapa
  const map = L.map('map',{
    zoomControl: false,
    boxZoom: false,
    doubleClickZoom: false,
    dragging: false,
    keyboard: false,
    scrollWheelZoom: false,
  }).setView([39, 1], 6);

  // Adicionar a camada basemap
  L.geoJson(countries, {
    interactive: false,
     style: function (feature) {
      // Define o estilo
      return {
      fillColor: '#118ab2',
      color: '#118ab2',
      fillOpacity: 1
      };
    }
  }).addTo(map);

  // Adicionar estilo para os portos
  var geojsonMarkerOptions = {
    radius: 5,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };

  // Adicionar a camada dos Portos
  var addportos = L.geoJson(portos,{
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, geojsonMarkerOptions);
        }
  }).addTo(map);

  // Adicionar a logica para as popup dos fretes
  function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.Origem) {
      layer.bindPopup(feature.properties.Mercadoria);
      }
  }

  // Adicionar estilo para os frestes
  var myStyle = {
    "color": "#ff7800",
    "weight": 2,
    "opacity": 0.65,
    //"offset": 10
  };

  // Adicionar a camada dos Fretes
  var addfretes = L.geoJson(fretes,{
    style: myStyle,
    onEachFeature: onEachFeature,
  });

  // Estabelecer um zoom de acordo com o geojson
  map.fitBounds(addportos.getBounds(),{
      //padding: [-41,1]//confirmar estes valores, podemos ter de alterar o geojson labelling pelo geojson dos portos que ainda não está adicionado
  });

      ////////////
  // Função para estabelecer uma ligação entre a mercadoria e os anos
  function getAnosComMercadoria(Mercadoria) {
    var anosMercadoria = [];

    // Iterar sobre o GeoJSON para encontrar os anos em que a mercadoria está disponível
    fretes.features.forEach(function (feature) {
      if (feature.properties.Mercadoria === Mercadoria) {
        anosMercadoria.push(feature.properties.Ano);
      }
    });

    return anosMercadoria;
  }
  
  // Função para estabelecer uma ligação entre a origem e os anos
  function getAnosOrigem(Origem) {
    var anosOrigem = [];

    // Iterar sobre o GeoJSON para encontrar os anos em que a mercadoria está disponível
    fretes.features.forEach(function (feature) {
      if (feature.properties.Origem === Origem) {
        anosOrigem.push(feature.properties.Ano);
        console.log(anosOrigem)
      }
    });

    return anosOrigem;
  }
  
  
  
  // Função para filtrar e exibir os dados do geojson no mapa
  function filtrarDados(e) {
    addfretes.eachLayer(function (layer) {
      if (layer.feature.properties.Ano >= e[0] && layer.feature.properties.Ano <= e[1]) {
        if (!map.hasLayer(layer)) {
          layer.addTo(map);
          }
          } else {
            map.removeLayer(layer);
            }
    });
  }
  
  // Função genérica para contar viagens com base em origem ou mercadoria
  function contarViagens(origemOuMercadoria, valor, anosRange) {
    var viagensContagem = 0;
    
  // Iterar sobre o GeoJSON para contar o número de viagens com base em origem ou mercadoria
  fretes.features.forEach(function (feature) {
    var ano = feature.properties.Ano;
    var propriedade = origemOuMercadoria === 'origem' ? feature.properties.Origem : feature.properties.Mercadoria;
    
    if (ano >= anosRange[0] && ano <= anosRange[1] && propriedade === valor) {
      viagensContagem++;
     }
    });
    
      return viagensContagem;
    }
  
  
      // Criação do slider
      var slider = document.getElementById('slider');
      noUiSlider.create(slider, {
        start: [1450, 1500],
        connect: true,
        tooltips: true,
        step: 1,
        format: wNumb({
          decimals: 0
        }),
        range: {
          'min': 1400,
          'max': 1500,
        }
      }).on('slide', function (e) {
        filtrarDados(e); // Chama a função para filtrar os dados quando o slider é movido
        var slideRange = e.map(parseFloat);//obtem o range de anos selecionados
        console.log(slideRange)
        mergeTooltips(slider, 15, ' - ');

        // Lógica para desabilitar as checkboxes de acordo com o range e o tipo de mercadoria
        $('.grupo-mercadoria input[type="checkbox"]') .each(function () {
          var checkbox = $(this);
          var mercadoria = checkbox.val();
          var anosComMercadoria = getAnosComMercadoria(mercadoria); // Função que retorna um array com os anos em que a mercadoria está disponível
          //console.log(anosComMercadoria)
  
  
          if (slideRange[0] <= Math.max(...anosComMercadoria) && slideRange[1] >= Math.min(...anosComMercadoria)) {
            checkbox.prop('checked', true); // Habilita a checkbox se a mercadoria estiver disponível no range selecionado
          } else {
            checkbox.prop('checked', false); // Desabilita a checkbox se a mercadoria não estiver disponível no range selecionado
            
          }
        });
  
  
        // Lógica para desabilitar as checkboxes de acordo com o range e a origem
        $('.grupo-origem input[type="checkbox"]') .each(function () {
          var checkboxOrigem = $(this);
          //console.log(checkboxOrigem)
          var origem = checkboxOrigem.val();
          //console.log(origem)
          var anosOrigem = getAnosOrigem(origem); // Função que retorna um array com os anos em que a origem está disponível
          //console.log(anosOrigem)
  
  
          if (slideRange[0] <= Math.max(...anosOrigem) && slideRange[1] >= Math.min(...anosOrigem)) {
            checkboxOrigem.prop('checked', true); // Habilita a checkbox se a mercadoria estiver disponível no range selecionado
          } else {
            checkboxOrigem.prop('checked', false); // Desabilita a checkbox se a mercadoria não estiver disponível no range selecionado
            
          }
        });
  
        // Função para atualizar as labels das checkboxes
      function atualizarLabels(origemOuMercadoria, checkboxes, anosRange) {
      checkboxes.forEach(function (checkbox) {
        var valor = checkbox.value;
        var contagem = contarViagens(origemOuMercadoria, valor, anosRange);
        var label = document.querySelector(`label[for="${checkbox.id}"]`);
        label.innerText = `${valor} (${contagem})`;
      });
    }
    
    // Chamar a função para atualizar as labels das checkboxes de origem
    var checkboxesOrigem = document.querySelectorAll('.grupo-origem input[type="checkbox"]');
    atualizarLabels('origem', checkboxesOrigem, slideRange);
    
    // Chamar a função para atualizar as labels das checkboxes de mercadoria
    var checkboxesMercadoria = document.querySelectorAll('.grupo-mercadoria input[type="checkbox"]');
    atualizarLabels('mercadoria', checkboxesMercadoria, slideRange);

  
  
        });

        
});