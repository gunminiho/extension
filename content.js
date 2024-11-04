console.log('Content script loaded');



window.addEventListener('load', () => {
  // Recupera los datos guardados del almacenamiento
  chrome.storage.sync.get('formData', ({ formData }) => {
    if (!formData) {
      console.log('No hay datos para completar el formulario.');
      return;
    }

    console.log('Datos del formulario recuperados:', formData);

    // Función para verificar y asignar valores
    function verificarYAsignarValor(elemento, valor, nombre) {
      if (!elemento) {
        console.warn(`No se encontró el elemento ${nombre}.`);
        return;
      }

      if (elemento.tagName === 'SELECT') {
        const opcion = elemento.querySelector(`option[value="${valor}"]`);
        if (opcion) {
          elemento.value = valor;
          console.log(`Valor ${valor} asignado a ${nombre}.`);
          // Simular el evento de cambio para actualizar los campos dinámicos
          const event = new Event('change', { bubbles: true });
          elemento.dispatchEvent(event);
        } else {
          console.warn(`Valor ${valor} no encontrado en las opciones de ${nombre}.`);
        }
      } else if (elemento.tagName === 'INPUT') {
        if (elemento.type === 'date') {
          const fechaValida = formatearFecha(valor);
          if (fechaValida) {
            elemento.value = fechaValida;
            console.log(`Valor de fecha ${fechaValida} asignado a ${nombre}.`);
          } else {
            console.warn(`Fecha inválida para ${nombre}: ${valor}.`);
          }
        } else {
          elemento.value = valor;
          console.log(`Valor ${valor} asignado a ${nombre}.`);
        }
      } else {
        console.warn(`El elemento ${nombre} no es un <select> o <input>.`);
      }
    }

    // Función para buscar el valor de un operador basado en el nombre
    function obtenerValorPorNombre(selectElement, nombre) {
      for (let i = 0; i < selectElement.options.length; i++) {
        const option = selectElement.options[i];
        if (option.text.trim() === nombre.trim()) {  // Asegúrate de eliminar espacios en blanco
          return option.value;
        }
      }
      console.warn(`No se encontró una opción con el nombre: ${nombre}`);
      return null;
    }

    // Función para formatear la fecha en YYYY-MM-DD
    function formatearFecha(fecha) {
      const date = new Date(fecha);
      if (!isNaN(date.getTime())) {
        const año = date.getFullYear();
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const día = String(date.getDate() + 1).padStart(2, '0');
        return `${año}-${mes}-${día}`;
      }
      return null;
    }

    // Asignar valores iniciales
    const unidadesInput = document.getElementById('select_unidad');
    const tipoInput = document.getElementById('selet_tipo_reportante');
    const medioInput = document.getElementById('select_medio_report');
    const fechaInput = document.getElementsByName('fecha_ocurrencia')[0];
    const prioridadInput = document.getElementById('select_severidad');
    const situacionInput = document.getElementById('select_estado');
    const asignadoInput = document.getElementsByName('operador_id')[0];

    verificarYAsignarValor(unidadesInput, formData.select_unidad, 'select_unidad');
    verificarYAsignarValor(tipoInput, formData.selet_tipo_reportante, 'selet_tipo_reportante');
    verificarYAsignarValor(medioInput, formData.select_medio_report, 'select_medio_report');
    verificarYAsignarValor(fechaInput, formData.fecha_ocurrencia, 'fecha_ocurrencia');
    verificarYAsignarValor(prioridadInput, formData.select_severidad, 'select_severidad');
    verificarYAsignarValor(situacionInput, formData.select_estado, 'select_estado');
    verificarYAsignarValor(asignadoInput, formData.operador_id, 'operador_id');

    // Listener para el cambio de medio_report
    medioInput.addEventListener('change', () => {
      console.log('Medio Reporte cambiado. Observando operador...');
      observarOperador();
    });

    // Función para observar y asignar el operador cuando cambia el medio
    function observarOperador() {
      const observer = new MutationObserver((mutationsList, observer) => {
        for (const mutation of mutationsList) {
          if (mutation.type === 'childList') {
            const operadorInput = document.getElementById('select_operador2');

            // Verifica si el elemento dependiente está presente
            if (operadorInput) {
              // Desconecta el observador una vez que el elemento ha sido encontrado
              observer.disconnect();

              // Obtén el valor correcto por nombre usando la variable correcta
              const valorOperador = obtenerValorPorNombre(operadorInput, formData.select_operador2);
              if (valorOperador) {
                // Implementar el delay de seguridad aquí
                setTimeout(() => {
                  operadorInput.value = valorOperador;
                  console.log(`Operador asignado a ${formData.select_operador2} con valor ${valorOperador}`);

                  // Cambiar el texto del span manualmente
                  const spanSeleccion = document.querySelector('#select2-select_operador2-container');
                  if (spanSeleccion) {
                    spanSeleccion.textContent = formData.select_operador2;
                    console.log(`Texto del span actualizado a: ${formData.select_operador2}`);
                  } else {
                    console.warn('No se pudo encontrar el span para actualizar el texto.');
                  }

                  // Simular el evento de cambio para activar cualquier lógica dependiente
                  const event = new Event('change', { bubbles: true });
                  operadorInput.dispatchEvent(event);
                }, 250); // Ajusta este valor según lo necesario
              } else {
                console.warn(`No se pudo asignar el operador ${formData.select_operador2}.`);
              }
            }
          }
        }
      });

      // Inicia la observación de cambios en el contenedor donde se carga el operador
      const targetNode = document.body;  // Ajusta este selector al contenedor específico si lo sabes
      const config = { childList: true, subtree: true };
      observer.observe(targetNode, config);
    }

    // Inicia la observación inicial del medio para establecer el operador
    if (medioInput) {
      // Asigna el valor inicial al medio y observa el operador
      verificarYAsignarValor(medioInput, formData.select_medio_report, 'select_medio_report');
    }
  });


  document.getElementById('check_centerMap').addEventListener('change', () => {
    console.log("oncgange true");
    if (check_centerMap.checked) {
  
      const coordenadas = document.getElementById('coordenadas').value;
      const [lat, lng] = coordenadas.trim().split(',')
  
      // Verifica que las coordenadas sean válidas
      if (!isNaN(lat) && !isNaN(lng)) {
        
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              files: ['content.js']
            }, () => {
              console.log("funcion flecha ", tabs[0].id, { action: 'moveToCoordinate', lat, lng });
             chrome.tabs.sendMessage(tabs[0].id, { action: 'moveToCoordinate', lat, lng }).then((response) => {
              console.log("response", response);
                
              });
              
            });
          } else {
            console.error("No hay una pestaña activa para enviar el mensaje.");
          }
        });
      } else {
        alert("Por favor, ingresa coordenadas válidas.");
      }
    }
  })
});




chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  if (message.action === 'moveToCoordinate') {
    console.log('moveToCoordinate');
    
    const { lat, lng } = message;
    // const mapContainer = document.getElementById('map'); // Asegúrate de que el contenedor tenga id "map"
    
    // Llama a la función que controla el mapa
    const result = moveMapToCoordinate(lat, lng);
    if (result) {
      sendResponse({ status: 'Mapa centrado y marcador añadido' });
    }
    else {
      sendResponse({ status: 'Mapa no encontrado' });
    }
    
  }
});

function injectScript(code) {
  const script = document.createElement('script');
  script.textContent = code;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

function moveMapToCoordinate(lat, lng) {
  const code = `
      (function() {
          if (window.L && window.map) {
              const coordinates = [${lat}, ${lng}];
              map.setView(coordinates, 18);
              const marker = L.marker(coordinates).addTo(map);
              marker.on('click', function() {
                  console.log('Marcador clicado automáticamente');
              });
              marker.fire('click');
          } else {
              console.error('Leaflet o el mapa no están definidos en la página.');
          }
      })();
  `;
  injectScript(code);
}

