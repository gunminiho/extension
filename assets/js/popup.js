function cargarDatosGuardados() {
    chrome.storage.sync.get('formData', ({ formData }) => {
        if (!formData) {
            console.log('No hay datos guardados.');
            return;
        }
        else
        {
            
        }

        console.log('Cargando datos guardados:', formData);

        // Rellenar el formulario con los datos recuperados
        document.getElementById('unidadesAtencion').value = formData.unidadesAtencion || 0;
        document.getElementById('medioReporte').value = formData.medioReporte || 0;
        document.getElementById('operador').value = formData.operador || '';
        document.getElementById('fechaOcurrencia').value = formData.fechaOcurrencia || '';
        document.getElementById('prioridad').value = formData.prioridad || 0;
        document.getElementById('situacion').value = formData.situacion || 0;
        document.getElementById('asignadoA').value = formData.asignadoA || 0;
    });
}