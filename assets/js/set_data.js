document.getElementById("dataForm").addEventListener("submit",(e)=>{

    e.preventDefault();

    // obtener valores de los campos del formulario

    const select_unidad = document.getElementById("select_unidad").value;
    const selet_tipo_reportante = document.getElementById("selet_tipo_reportante").value;
    const select_medio_report = document.getElementById("select_medio_report").value;
    const select_operador2 = document.getElementById("select_operador2").value;
    const fecha_ocurrencia = document.getElementById("fecha_ocurrencia").value;
    const select_severidad = document.getElementById('select_severidad').value;
    const select_estado = document.getElementById('select_estado').value;
    const operador_id = document.getElementById('operador_id').value;

      // Crear un objeto con los datos
      const formData = {
        select_unidad,
        selet_tipo_reportante,
        select_medio_report,
        select_operador2,
        fecha_ocurrencia,
        select_severidad,
        select_estado,
        operador_id
    };

     // Guardar los datos en el almacenamiento de Chrome
     chrome.storage.sync.set({ formData }, () => {
        console.log('Datos guardados:', formData);
        alert('Datos guardados exitosamente!');
    });

});

document.addEventListener('DOMContentLoaded', () => {
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

    // Función para formatear la fecha en YYYY-MM-DD
    function formatearFecha(fecha) {
      const date = new Date(fecha);
      if (!isNaN(date.getTime())) {
        const año = date.getFullYear();
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const día = String(date.getDate()+1).padStart(2, '0');
        return `${año}-${mes}-${día}`;
      }
      return null;
    }

    // Asignar valores guardados al formulario
    verificarYAsignarValor(document.getElementById('select_unidad'), formData.select_unidad, 'select_unidad');
    verificarYAsignarValor(document.getElementById('selet_tipo_reportante'), formData.selet_tipo_reportante, 'selet_tipo_reportante');
    verificarYAsignarValor(document.getElementById('select_medio_report'), formData.select_medio_report, 'select_medio_report');
    verificarYAsignarValor(document.getElementById('select_operador2'), formData.select_operador2, 'select_operador2');
    verificarYAsignarValor(document.getElementById('fecha_ocurrencia'), formData.fecha_ocurrencia, 'fecha_ocurrencia');
    verificarYAsignarValor(document.getElementById('select_severidad'), formData.select_severidad, 'select_severidad');
    verificarYAsignarValor(document.getElementById('select_estado'), formData.select_estado, 'select_estado');
    verificarYAsignarValor(document.getElementById('operador_id'), formData.operador_id, 'operador_id');
  });
});



