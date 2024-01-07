$(document).ready(function(){
  
  // Criar o mapa
  const map = L.map('map',{
    zoomControl: false,
    boxZoom: false,
    doubleClickZoom: true,
    dragging: false,
    keyboard: false,
    scrollWheelZoom: true,
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
    weight: 0.5,
    opacity: 1,
    fillOpacity: 0.8
  };

  // Criar onEachFeature para a camada dos Portos
  function onEachFeaturePortos(feature, layer) {
    if (feature.properties && feature.properties.Nome) {
        layer.on('click', function() {
            var modalContent = '<div class="container">' +
                                   '<div class="row">' +
                                     '<div class="col-md-3"><div class="square"><p class="nr-fretes">Total de fretes</p><p>18</p></div></div>' +
                                     '<div class="col-md-4"><div class="square"><p class="nr-fretes">Mercadoria mais transportada</p><p>Sal</p></div></div>' +
                                     '<div class="col-md-2"><div class="chartPortos">col2</div></div>' +
                                     '<div class="col-md-2"><div class="square">col3</div></div>' +
                                     '<div class="col-md-2"><div class="square">col4</div></div>' +
                                     '<div class="col-md-2"><div class="square">col5</div></div>' +
                                     '<div class="col-md-2"><div class="square">col6</div></div>' +

                                   '</div>' +
                                 '</div>';

            // Inserir o conteúdo no modal
            document.getElementById('modalContent').innerHTML = modalContent;
            document.getElementById('exampleModalLabel').innerHTML = '<h5> Detalhes do Porto -  ' + feature.properties.Nome + '</h5>'

            // Abrir o modal
            $('#myModal').modal('show');
        });

        // Adicionar tooltip para os portos
        var tooltipContent = feature.properties.Nome;
        layer.bindTooltip(tooltipContent,{
          permanent:false
        });
        layer.openTooltip()
    }
}

  // Adicionar a camada dos Portos
  var addportos = L.geoJson(portos,{
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng, geojsonMarkerOptions);
        },
      onEachFeature: onEachFeaturePortos
  }).addTo(map);

  // Adicionar a logica para as popup dos fretes
  function onEachFeatureFretes(feature, layer) {
    if (feature.properties && feature.properties.Origem) {
      layer.bindPopup('Ano: ' + feature.properties.Ano + ' id: ' +  feature.properties.id + ' Embarcação: ' +  feature.properties.NomeEmbar);
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
    onEachFeature: onEachFeatureFretes,
  });

  // Adicionar a camada das Rotas
  var addrotas = L.geoJson(rotas, {
    style: myStyle
  });

  // Estabelecer um zoom de acordo com o geojson
  map.fitBounds(addportos.getBounds(),{
      //padding: [-41,1]//confirmar estes valores, podemos ter de alterar o geojson labelling pelo geojson dos portos que ainda não está adicionado
  });

  // preencher os dropdown
  var propriedadesFretes = [];
  var valoresPropriedades = {};
  

  // Itere sobre os recursos de fretes para extrair as propriedades e valores
  rotas.features.forEach(function(feature) {
  var properties = feature.properties;

   // Itere sobre as propriedades de cada recurso
   for (var propriedade in properties) {
    if (properties.hasOwnProperty(propriedade) && propriedadesFretes.indexOf(propriedade) === -1) {
        // Adicione a propriedade à lista de propriedades, se ainda não estiver lá
        propriedadesFretes.push(propriedade);
        // Inicialize o array de valores para esta propriedade
        valoresPropriedades[propriedade] = [];
    }

    // Adicione o valor da propriedade ao array de valores
    valoresPropriedades[propriedade].push(properties[propriedade]);
}
});

// Inicialize um objeto para armazenar os valores únicos de cada propriedade
var valoresUnicos = {};

// Itere sobre os recursos de fretes para extrair as propriedades e valores únicos
rotas.features.forEach(function(feature) {
  var properties = feature.properties;
  

  // Itere sobre as propriedades de cada recurso
  for (var propriedade in properties) {
      if (properties.hasOwnProperty(propriedade)) {
          // Verifique se a propriedade já existe no objeto
          if (!(propriedade in valoresUnicos)) {
              valoresUnicos[propriedade] = new Set();
          }
          // Adicione o valor da propriedade ao conjunto
          valoresUnicos[propriedade].add(properties[propriedade]);
          console.log(valoresUnicos)
      }
  }
});

// Referência ao elemento dropdown1 e dropdown2
var dropdown1 = document.getElementById('categoria-dropdown');
var dropdown2 = document.querySelector('#opcao-dropdown .dropdown-menu');

// Função para preencher o dropdown2 com base na propriedade selecionada
function preencherDropdown(propriedadeSelecionada, camada) {

    // Inicializa os limites (bounds) para cobrir todas as features correspondentes
    var bounds = L.latLngBounds([]);

    // Atualiza o texto do botão do dropdown1 com a propriedade selecionada
    dropdown1.querySelector('#btn-categoria').innerText = propriedadeSelecionada;

    // Limpe os itens antigos
    dropdown2.innerHTML = '';

    /// Verifique se a propriedade está presente na sua camada (fretes ou rotas)
    if (valoresUnicos.hasOwnProperty(propriedadeSelecionada)) {
      var valoresOrdenados = Array.from(valoresUnicos[propriedadeSelecionada]).sort();
      valoresOrdenados.forEach(function(valor) {
          var listItem = document.createElement('li');
          listItem.classList.add('li-dropdown');
          var link = document.createElement('a');
          link.innerText = valor;
          listItem.appendChild(link);
          dropdown2.appendChild(listItem);

          // Adicione um evento de clique para adicionar a feature ao mapa
          listItem.addEventListener('click', function() {

            var bounds = L.latLngBounds([]);

            // Atualiza o texto do botão do dropdown2 para a opção selecionada
            dropdown2.parentNode.querySelector('.btn').innerText = valor;

              // Remove apenas as camadas da variável 'camada'
              camada.eachLayer(function(layer) {
                map.removeLayer(layer);
              });
              
              // Itera sobre as camadas novamente para adicionar apenas as correspondentes
              camada.eachLayer(function(layer) {
                  if (layer.feature.properties[propriedadeSelecionada] === valor) {
                      // Adiciona a feature ao mapa
                      map.addLayer(layer);
                      // Expande os limites para incluir a feature
                      bounds.extend(layer.getBounds());
                  }
              });
              
              // Ajusta o mapa para exibir todas as features correspondentes
              map.fitBounds(bounds, {
                maxZoom: 8,
                minZoom: 15
              });
          });
      });
  }

    // Atualiza o texto do botão do dropdown2 para a opção padrão
    dropdown2.parentNode.querySelector('.btn').innerText = 'Selecione uma opção';
}

// Evento de clique nos itens do primeiro dropdown
var categoriaDropdownItens = document.querySelectorAll('#categoria-dropdown .dropdown-item');
categoriaDropdownItens.forEach(function(item) {
    item.addEventListener('click', function() {
        // Obtém o texto do item clicado
        var propriedadeSelecionada = item.innerText;
        // Preenche o dropdown2 com base na propriedade selecionada e na camada addfretes
        preencherDropdown(propriedadeSelecionada, addfretes);
        // Preenche o dropdown2 com base na propriedade selecionada e na camada addrotas
        preencherDropdown(propriedadeSelecionada, addrotas);
    });
});


  
});