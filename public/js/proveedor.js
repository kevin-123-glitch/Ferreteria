


document.addEventListener('DOMContentLoaded', () => {


  
    obtenerProveedor();

});




//************************************************************************************************* */

function obtenerProveedor() {

    const tableElement = $('#diseñoTable');

    if ($.fn.DataTable.isDataTable(tableElement)) {
        tableElement.DataTable().destroy();
    }

    fetch(`${apiBaseUrl}/proveedor`)
        .then(response => response.json())
        .then(data => {
            console.log('Datos recibidos:', data);

            const tableBody = document.querySelector('#diseñoTable tbody');

            if (!tableBody) {
                console.error('No se encontró el elemento <tbody> de la tabla');
                return;
            }

            tableBody.innerHTML = ''; // Limpiar la tabla

            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.id_proveedor - b.id_proveedor);

                data.forEach((proveedor, index) => {
                    const row = document.createElement('tr');
                    row.setAttribute('data-id', proveedor.id_proveedor);

                    if (index % 2 === 0) {
                        row.classList.add('even');
                    } else {
                        row.classList.add('odd');
                    }

            
                    row.innerHTML = `
                        <td>${proveedor.id_proveedor || '--'}</td>
                        <td>${proveedor.Documeto_identidad || '--'}</td>
                        <td>${proveedor.Numero_documento || '--'}</td>
                        <td>${proveedor.Nombre_empresa || '--'}</td>
                        <td>${proveedor.Contacto || '--'}</td>
                        <td>${proveedor.Telefono || '--'}</td>
                        <td>${proveedor.Direccion || '--'}</td>
                        <td>${proveedor.Provincia || '--'}</td>
                        <td>${proveedor.Distrito || '--'}</td>
                        <td>${proveedor.Correo || '--'}</td>          
                        <td>${proveedor.Rubro || '--'}</td>
                        <td>
                            <button class="btn btn-warning btn-sm edit-btn" onclick="abrirModalEditar(${proveedor.id_proveedor})">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                            <button class="btn btn-danger btn-sm delete-btn" onclick="eliminar(${proveedor.id_proveedor})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;

                    tableBody.appendChild(row);
                });

                // Inicializar DataTables en la tabla después de cargar los datos
                tableElement.DataTable({
                    pageLength: 10,
                    lengthMenu: [5, 10, 15, 20, 100, 200, 500],
                    columnDefs: [
                        
                        {
                            targets: [ 4,5,6,7,8,9,10], // Índices de las columnas a ocultar en vistas móviles
                            className: 'hide-mobile'
                        },
                        {
                            targets: [0,9], // Índices de las columnas a ocultar en vistas de escritorio
                            className: 'hide-computer'
                        }
                    ],
                    language: {
                        lengthMenu: "Mostrar _MENU_ ",
                        zeroRecords: "Ningún registro encontrado",
                        info: "Mostrando de ( _START_ a _END_ ) de un total de _TOTAL_ registros",
                        infoEmpty: "Ningún registro encontrado",
                        infoFiltered: "(filtrados desde _MAX_ registros totales)",
                        loadingRecords: "Cargando...",
                        paginate: {
                            first: "Primero",
                            last: "Último",
                            next: "Siguiente",
                            previous: "Anterior"
                        },
                        search: "Buscar:"
                    }
                });

                setupSearch();
                setupExporta();
                generateExcel();

            } else {
                console.error('No hay datos para mostrar o los datos no están en formato de array.');
            }
        })
        .catch(error => console.error('Error al obtener los datos:', error));
}





function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const table = document.getElementById('diseñoTable');
    
    // Verificar si los elementos existen en el DOM
    if (!searchInput) {
        console.error('El elemento de búsqueda con el ID "search-input" no se encontró en el DOM');
        return;
    }
    
    if (!table) {
        console.error('La tabla con el ID "personalTable" no se encontró en el DOM');
        return;
    }

    // Verificar si tbody existe
    const tbody = table.getElementsByTagName('tbody')[0];
    if (!tbody) {
        console.error('No se encontró el elemento <tbody> en la tabla');
        return;
    }

    const rows = tbody.getElementsByTagName('tr');

    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();

        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            let match = false;

            for (let j = 0; j < cells.length; j++) {
                const cell = cells[j];
                if (cell.textContent.toLowerCase().includes(filter)) {
                    match = true;
                    break;
                }
            }

            rows[i].style.display = match ? '' : 'none';
        }
    });
} 

function setupExporta() {
    document.getElementById('exportToPDF').addEventListener('click', generatePDF);
}

function generatePDF() {
    const table = document.querySelector('#diseñoTable');
    const rows = [];

    table.querySelectorAll('tbody tr').forEach(row => {
        const cols = row.querySelectorAll('td');
        rows.push([
            cols[1].textContent,
            cols[2].textContent,
            cols[3].textContent,
            cols[4].textContent,
            cols[5].textContent,
            cols[6].textContent,
            cols[7].textContent,
            cols[8].textContent,
            cols[10].textContent,

        ]);
    });

    const props = {
        outputType: "save",
        returnJsPDFDocObject: true,
        fileName: "ProveedorDataReport.pdf",
        orientationLandscape: true,
        compress: true,
        logo: {
            src: "../images/LogoMenu.png",
            width: 53.33,
            height: 26.66,
            margin: { top: 0, left: 0 }
        },
        business: {
            name: "Reporte de proveedores",
            address: "Ferreteria Cristo Nazareno Del Sur",
            phone: "999222333",
            email: "Nestares@correo.com ",
            website: "Fecha : " + new Date().toLocaleDateString(),
        },
        invoice: {
            headerBorder: true,
            tableBodyBorder: true,
            header: [
                { title: "Tipo", style: { width: 12 } },
                { title: "Documento", style: { width: 25 } },
                { title: "Empresa", style: { width: 65 } },
                { title: "Contacto", style: { width: 40 } },
                { title: "Teléfono", style: { width: 20 } },
                { title: "Direccion", style: { width: 50 } },
                { title: "Provincia", style: { width: 22 } },
                { title: "Distrito", style: { width: 22 } },
                { title: "Rubro", style: { width: 25 } },

            ],





            table: rows,
        },
        pageLabel: "Page "
    };

    jsPDFInvoiceTemplate.default(props);
}

function generateExcel() {
    document.getElementById('buttons-excel').addEventListener('click', function () {
        // Llama al endpoint que exporta los datos a Excel
        window.location.href = `${apiBaseUrl}/proveedor/exportExcel`;

    });
}

function eliminar(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch(`${apiBaseUrl}/proveedor/${id}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(text => {
                            throw new Error(text || 'Error al eliminar el registro');
                        });
                    }
                    return response.text();
                })
                .then(message => {
                    Swal.fire({
                        title: '¡Eliminado!',
                        text: message,
                        icon: 'success',
                        timer: 1000,               // Tiempo en milisegundos (3000 ms = 3 segundos)
                        showConfirmButton: false    // Ocultar botón de confirmación
                    }).then(() => {
                        obtenerProveedor(); // Actualiza la lista después de eliminar
                    });
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        title: 'Error',
                        text: error.message || 'Hubo un problema al intentar eliminar el registro.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                });
        }
    });
}


function abrirModalEditar(id) {
    isEditMode = true;

    // Cambiar el texto del botón
    document.getElementById('submitButton').textContent = 'Guardar Cambios';
    document.getElementById('modalLabel').textContent = 'Modificar datos del Proveedor';

    const row = document.querySelector(`#diseñoTable tr[data-id="${id}"]`);

    if (row) {
        // Obtener los valores de la fila y validarlos
        const documetoIdentidad = validateField(row.querySelector('td:nth-child(2)').textContent.trim());
        const numeroDocumento = validateField(row.querySelector('td:nth-child(3)').textContent.trim());
        const nom = validateField(row.querySelector('td:nth-child(4)').textContent.trim());
        const contac = validateField(row.querySelector('td:nth-child(5)').textContent.trim());        
        const telefono = validateField(row.querySelector('td:nth-child(6)').textContent.trim());
        const direc = validateField(row.querySelector('td:nth-child(7)').textContent.trim());
        const pro = validateField(row.querySelector('td:nth-child(8)').textContent.trim());
        const dis = validateField(row.querySelector('td:nth-child(9)').textContent.trim());
        const corre = validateField(row.querySelector('td:nth-child(10)').textContent.trim());
        const rubro = validateField(row.querySelector('td:nth-child(11)').textContent.trim());


        // Asignar los valores validados al formulario
        document.getElementById('numero_documento').value = numeroDocumento;
        document.getElementById('nombre').value = nom;
        document.getElementById('contacto').value = contac;
        document.getElementById('telefono').value = telefono;
        document.getElementById('direccion').value = direc;
        document.getElementById('provincia').value = pro;
        document.getElementById('distrito').value = dis;
        document.getElementById('correo').value = corre;
        document.getElementById('rubro').value = rubro;

        // Establecer el valor del combo box basado en el nombre
        const tipoDocSelect = document.getElementById('ID_Tipo_Doc');
        for (let option of tipoDocSelect.options) {
            if (option.textContent.trim() === documetoIdentidad) {
                tipoDocSelect.value = option.value;
                break;
            }
        }
       
        document.getElementById('numero_documento').style.borderColor = 'black';
        document.getElementById('nombre').style.borderColor = 'black';
        document.getElementById('contacto').style.borderColor = 'black';
        document.getElementById('telefono').style.borderColor = 'black';
        document.getElementById('direccion').style.borderColor = 'black';
        document.getElementById('provincia').style.borderColor = 'black';
        document.getElementById('distrito').style.borderColor = 'black';
        document.getElementById('correo').style.borderColor = 'black';
        document.getElementById('rubro').style.borderColor = 'black';
        document.getElementById('ID_Tipo_Doc').style.borderColor = 'black';


        // Obtener el elemento del modal
        var modalElement = document.getElementById('registrarProveedorModal');
        // Crear una instancia del modal de Bootstrap
        var modal = new bootstrap.Modal(modalElement);
        // Mostrar el modal
        modal.show();

        updateFloatingLabels(true);
    }
}

// Función para validar el campo
function validateField(fieldValue) {
    return fieldValue === "--" ? "" : fieldValue;
}


function abrirModalRegistrar() {
    isEditMode = false;

    // Cambiar el texto del botón
    document.getElementById('submitButton').textContent = 'Registrar';

    // Limpiar los campos del formulario
    document.getElementById('proveedorForm').reset();
    // Mostrar el modal
    var modalElement = document.getElementById('registrarProveedorModal');
    var modal = new bootstrap.Modal(modalElement);
    modal.show();
    updateFloatingLabels(false);


}
function updateFloatingLabels(isEditMode) {
    const selects = document.querySelectorAll('.floating-label-select-group .form-control');

    selects.forEach(select => {
        if (isEditMode) {
            // En modo edición, siempre mostrar etiquetas
            select.nextElementSibling.style.display = 'block';
        } else {
            // En modo registro, actualizar visibilidad de etiquetas basadas en el valor del <select>
            updateFloatingLabel(select);
        }

        // Agregar un listener para cambios en el <select>
        select.addEventListener('change', function () {
            updateFloatingLabel(this);
        });
    });
}
function updateFloatingLabel(selectElement) {
    const label = selectElement.nextElementSibling; // Asume que el label sigue al select
    const defaultOption = selectElement.querySelector('option[value=""]');
    if (selectElement.value === defaultOption.value) {
        label.style.display = 'none'; // Oculta la etiqueta si la opción por defecto (vacía) está seleccionada
    } else {
        label.style.display = 'block'; // Muestra la etiqueta si se selecciona una opción válida
    }
}