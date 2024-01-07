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


  ////
  function getAnosPorPropriedade(propriedade, valor) {
    var anos = [];
    fretes.features.forEach(function (feature) {
      if (feature.properties[propriedade] === valor) {
        anos.push(feature.properties.Ano);
      }
    });
    return anos;
  }
  
  function contarViagens(propriedade, valor, anosRange) {
    return fretes.features.filter(function (feature) {
      var ano = feature.properties.Ano;
      return ano >= anosRange[0] && ano <= anosRange[1] && feature.properties[propriedade] === valor;
    }).length;
  }

  function atualizarCheckboxesComValoresIniciais(sliderValues) {
    var checkboxesOrigem = document.querySelectorAll('.grupo-origem input[type="checkbox"]');
    checkboxesOrigem.forEach(function (checkbox) {
      var origem = checkbox.value;
      checkbox.checked = sliderValues[0] <= Math.max(...getAnosPorPropriedade('Origem', origem)) &&
                        sliderValues[1] >= Math.min(...getAnosPorPropriedade('Origem', origem));
      var contagem = contarViagens('Origem', origem, sliderValues);
      var label = document.querySelector(`label[for="${checkbox.id}"]`);
      label.innerText = `${origem} (${contagem})`;
    });
  
    var checkboxesMercadoria = document.querySelectorAll('.grupo-mercadoria input[type="checkbox"]');
    checkboxesMercadoria.forEach(function (checkbox) {
      var mercadoria = checkbox.value;
      checkbox.checked = sliderValues[0] <= Math.max(...getAnosPorPropriedade('Mercadoria', mercadoria)) &&
      sliderValues[1] >= Math.min(...getAnosPorPropriedade('Mercadoria', mercadoria));
      var contagem = contarViagens('Mercadoria', mercadoria, sliderValues);
      var label = document.querySelector(`label[for="${checkbox.id}"]`);
      label.innerText = `${mercadoria} (${contagem})`;
    });
  
    var checkboxesNomeEmbarcacao = document.querySelectorAll('.grupo-nome-embarcacao input[type="checkbox"]');
    checkboxesNomeEmbarcacao.forEach(function (checkbox) {
      var nomeEmbarcacao = checkbox.value;
      checkbox.checked = sliderValues[0] <= Math.max(...getAnosPorPropriedade('NomeEmbar', nomeEmbarcacao)) &&
                        sliderValues[1] >= Math.min(...getAnosPorPropriedade('NomeEmbar', nomeEmbarcacao));
      var contagem = contarViagens('NomeEmbar', nomeEmbarcacao, sliderValues);
      var label = document.querySelector(`label[for="${checkbox.id}"]`);
      label.innerText = `${nomeEmbarcacao} (${contagem})`;
    });
  
    var checkboxesTipoRegisto = document.querySelectorAll('.grupo-tipo-registo input[type="checkbox"]');
    checkboxesTipoRegisto.forEach(function (checkbox) {
      var tipoRegisto = checkbox.value;
      checkbox.checked = sliderValues[0] <= Math.max(...getAnosPorPropriedade('TRegisto', tipoRegisto)) &&
                        sliderValues[1] >= Math.min(...getAnosPorPropriedade('TRegisto', tipoRegisto));
      var contagem = contarViagens('TRegisto', tipoRegisto, sliderValues);
      var label = document.querySelector(`label[for="${checkbox.id}"]`);
      label.innerText = `${tipoRegisto} (${contagem})`;
    });
  }
  
  var slider = document.getElementById('slider');
  noUiSlider.create(slider, {
    start: [1400, 1411],
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
    filtrarDados(e);
  
    var slideRange = e.map(parseFloat);
    mergeTooltips(slider, 15, ' - ');

    atualizarCheckboxesComValoresIniciais(slideRange);
  });
  
    
  
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

  // Adicionar event listeners para checkboxes de mercadorias
var checkboxesMercadoria = document.querySelectorAll('.grupo-mercadoria input[type="checkbox"]');
checkboxesMercadoria.forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
        filtrarDados(slider.noUiSlider.get()); // Obtém os valores atuais do slider e filtra os dados com base neles
    });
});

// Adicionar event listeners para checkboxes de Origem
var checkboxesOrigem = document.querySelectorAll('.grupo-origem input[type="checkbox"]');
checkboxesOrigem.forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
        filtrarDados(slider.noUiSlider.get());
    });
});

// Adicionar event listeners para checkboxes de TRegisto
var checkboxesTRegisto = document.querySelectorAll('.grupo-tipo-registo input[type="checkbox"]');
checkboxesTRegisto.forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
        filtrarDados(slider.noUiSlider.get());
    });
});

// Adicionar event listeners para checkboxes de NomeEmbar
var checkboxesNomeEmbarcacao = document.querySelectorAll('.grupo-nome-embarcacao input[type="checkbox"]');
checkboxesNomeEmbarcacao.forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
        filtrarDados(slider.noUiSlider.get());
    });
});

// Função para filtrar dados com base nos valores atuais do slider e checkboxes
function filtrarDados(sliderValues) {
    addfretes.eachLayer(function (layer) {
        var ano = layer.feature.properties.Ano;
        var origem = layer.feature.properties.Origem;
        var mercadoria = layer.feature.properties.Mercadoria;
        var tipoRegisto = layer.feature.properties.TRegisto;
        var nomeEmbarcacao = layer.feature.properties.NomeEmbar;
        var slideRange = sliderValues.map(parseFloat);
        var isAnoValido = ano >= slideRange[0] && ano <= slideRange[1];
        var isOrigemSelecionada = Array.from(checkboxesOrigem).some(function (checkbox) {
            return checkbox.checked && checkbox.value === origem;
        });
        var isMercadoriaSelecionada = Array.from(checkboxesMercadoria).some(function (checkbox) {
            return checkbox.checked && checkbox.value === mercadoria;
        });
        var isTRegistoSelecionado = Array.from(checkboxesTRegisto).some(function (checkbox) {
            return checkbox.checked && checkbox.value === tipoRegisto;
        });
        var isNomeEmbarcacaoSelecionado = Array.from(checkboxesNomeEmbarcacao).some(function (checkbox) {
            return checkbox.checked && checkbox.value === nomeEmbarcacao;
        });

        if (isAnoValido && isOrigemSelecionada && isMercadoriaSelecionada && isTRegistoSelecionado && isNomeEmbarcacaoSelecionado) {
            if (!map.hasLayer(layer)) {
                layer.addTo(map);
                console.log("viagem adicionada: ", layer.feature);
            }
        } else {
            map.removeLayer(layer);
        }
    });
}
// Chame a função para atualizar checkboxes com os valores iniciais do slider
var valoresIniciaisSlider = slider.noUiSlider.get();
filtrarDados(valoresIniciaisSlider)
atualizarCheckboxesComValoresIniciais(valoresIniciaisSlider);

        
});