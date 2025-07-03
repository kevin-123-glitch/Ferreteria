


document.addEventListener('DOMContentLoaded', () => {


  
    obtenerPersonal();

});




//************************************************************************************************* */

function obtenerPersonal() {

    const tableElement = $('#diseñoTable');

    if ($.fn.DataTable.isDataTable(tableElement)) {
        tableElement.DataTable().destroy();
    }

    fetch(`${apiBaseUrl}/personal`)
        .then(response => response.json())
        .then(data => {
 
            const tableBody = document.querySelector('#diseñoTable tbody');

            if (!tableBody) {
                console.error('No se encontró el elemento <tbody> de la tabla');
                return;
            }

            tableBody.innerHTML = ''; // Limpiar la tabla

            if (Array.isArray(data) && data.length > 0) {
                data.sort((a, b) => a.idPersonal - b.idPersonal);

                data.forEach((personal, index) => {
                    const row = document.createElement('tr');
                    row.setAttribute('data-id', personal.idPersonal);

                    if (index % 2 === 0) {
                        row.classList.add('even');
                    } else {
                        row.classList.add('odd');
                    }

                    let estadoIcon;
                    switch (personal.estado_usuario) {
                        case 'Activo':
                            estadoIcon = '<i class="fas fa-circle active"></i>';
                            break;
                        case 'Desconectado':
                            estadoIcon = '<i class="fas fa-circle inactive"></i>';
                            break;
                        case 'Bloqueado':
                            estadoIcon = '<i class="fas fa-lock blocked"></i>';
                            break;
                        default:
                            estadoIcon = '<i class="fas fa-circle unknown"></i>';
                            break;
                    }

                    row.innerHTML = `
                        <td>${personal.idPersonal || 'No definido'}</td>
                        <td>${personal.Documeto_identidad || 'No definido'}</td>
                        <td>${personal.Numero_documento || 'No definido'}</td>
                        <td>${personal.Nombre || 'No definido'}</td>
                        <td>${personal.Apellido || 'No definido'}</td>
                        <td>${personal.Provincia || 'No definido'}</td>
                        <td>${personal.Distrito || 'No definido'}</td>
                        <td>${personal.Direccion || 'No definido'}</td>
                        <td>${personal.Correo || 'No definido'}</td>
                        <td>${personal.Telefono || 'No definido'}</td>
                        <td>${personal.Fecha_acceso || 'No definido'}</td>
                        <td>${personal.Perfil || 'No definido'}</td>
                        <td>${estadoIcon}</td>
                        <td>
                            <button class="btn btn-warning btn-sm edit-btn" onclick="abrirModalEditar(${personal.idPersonal})">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                            <button class="btn btn-danger btn-sm delete-btn" onclick="eliminar(${personal.idPersonal})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                        <td>${personal.Contraseña || 'No definido'}</td>
                    `;

                    tableBody.appendChild(row);
                });

                // Inicializar DataTables en la tabla después de cargar los datos
                tableElement.DataTable({
                    pageLength: 10,
                    lengthMenu: [5, 10, 15, 20, 100, 200, 500],
                    columnDefs: [
                        {
                            targets: [0, 1, 2, 5, 6, 7, 8, 9, 10, 14], // Índices de las columnas a ocultar en vistas móviles
                            className: 'hide-mobile'
                        },
                        {
                            targets: [0,14], // Índices de las columnas a ocultar en vistas de escritorio
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



                generateExcel();
                setupExporta();
                setupSearch();

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
//*************************************************************************************************

function setupExporta() {
    document.getElementById('exportToPDF').addEventListener('click', generatePDF);
}

function generatePDF() {
    const table = document.querySelector('#diseñoTable');
    const rows = [];

    table.querySelectorAll('tbody tr').forEach(row => {
        const cols = row.querySelectorAll('td');
        rows.push([
            cols[0].textContent,
            cols[2].textContent,
            cols[3].textContent,
            cols[4].textContent,
            cols[8].textContent,
            cols[9].textContent,
            cols[11].textContent,
        ]);
    });

    const props = {
        outputType: "save",
        returnJsPDFDocObject: true,
        fileName: "PersonalDataReport.pdf",
        orientationLandscape: false,
        compress: true,
        logo: {
            src: "../images/LogoMenu.png",
            width: 53.33,
            height: 26.66,
            margin: { top: 0, left: 0 }
        },
        business: {
            name: "Reporte del personal",
            address: "Ferreteria Cristo Nazareno Del Sur",
            phone: "999222333",
            email: "Nestares@correo.com ",
            website: "Fecha : " + new Date().toLocaleDateString(),
        },
        invoice: {
            headerBorder: true,
            tableBodyBorder: true,
            header: [
                { title: "#", style: { width: 10 } },
                { title: "Documento", style: { width: 25 } },
                { title: "Nombre", style: { width: 28 } },
                { title: "Apellido", style: { width: 33 } },
                { title: "Correo", style: { width: 40 } },
                { title: "Teléfono", style: { width: 28 } },
                { title: "Perfil", style: { width: 28 } },
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
        window.location.href = `${apiBaseUrl}/personal/exportExcel`;

    });
}


function abrirModalEditar(id) {

    isEditMode = true;

    // Cambiar el texto del botón
    document.getElementById('submitButton').textContent = 'Guardar Cambios';
    document.getElementById('modalLabel').textContent = 'Modificar datos del personal';

    const row = document.querySelector(`#diseñoTable tr[data-id="${id}"]`);


    if (row) {
        const documetoIdentidad = row.querySelector('td:nth-child(2)').textContent.trim();
        const numeroDocumento = row.querySelector('td:nth-child(3)').textContent.trim();
        const nom = row.querySelector('td:nth-child(4)').textContent.trim();
        const ape = row.querySelector('td:nth-child(5)').textContent.trim();
        const pro = row.querySelector('td:nth-child(6)').textContent.trim();
        const dis = row.querySelector('td:nth-child(7)').textContent.trim();
        const direc = row.querySelector('td:nth-child(8)').textContent.trim();
        const corre = row.querySelector('td:nth-child(9)').textContent.trim();
        const telefono = row.querySelector('td:nth-child(10)').textContent.trim();
        const perfil = row.querySelector('td:nth-child(12)').textContent.trim();
        const contra = row.querySelector('td:nth-child(15)').textContent.trim();


        const estadoIcon = row.querySelector('td:nth-child(13)').innerHTML.trim(); // Obtén el HTML del ícono

        // Mapeo de íconos a nombres de estado
        const estadoMap = {
            '<i class="fas fa-circle active"></i>': 'Activo',
            '<i class="fas fa-circle inactive"></i>': 'Desconectado',
            '<i class="fas fa-lock blocked"></i>': 'Bloqueado',
            '<i class="fas fa-circle unknown"></i>': 'Desconocido'
        };

        // Obtén el nombre del estado basado en el ícono
        const estado = estadoMap[estadoIcon] || 'Desconocido';
        //const documetoIdentidad = row.querySelector('td:nth-child(2)').textContent.trim();


        // document.getElementById('id_tipo_doc').value = documetoIdentidad || '';
        document.getElementById('numero_documento').value = numeroDocumento || '';
        document.getElementById('nombre').value = nom || '';
        document.getElementById('apellido').value = ape || '';
        document.getElementById('provincia').value = pro || '';
        document.getElementById('distrito').value = dis || '';
        document.getElementById('direccion').value = direc || '';
        document.getElementById('correo').value = corre || '';
        document.getElementById('telefono').value = telefono || '';
        document.getElementById('contrasena').value = contra || '';
        document.getElementById('Rcontrasena').value = contra || '';

        document.getElementById('Rcontrasena').value = contra || '';


        // Establecer el valor del combo box basado en el nombre
        const tipoDocSelect = document.getElementById('id_tipo_doc');
        for (let option of tipoDocSelect.options) {
            if (option.textContent.trim() === documetoIdentidad) {
                tipoDocSelect.value = option.value;
                break;
            }
        }
        // Establecer el valor del combo box basado en el nombre
        const tipoPerSelect = document.getElementById('id_perfil');
        for (let option of tipoPerSelect.options) {
            if (option.textContent.trim() === perfil) {
                tipoPerSelect.value = option.value;
                break;
            }
        }
        // Establecer el valor del combo box basado en el nombre
        const tipoEstadoSelect = document.getElementById('id_estado_usuario');
        for (let option of tipoEstadoSelect.options) {
            if (option.textContent.trim() === estado) {
                tipoEstadoSelect.value = option.value;
                break;
            }
        }
        // Aplicar la clase de borde verde a los campos del formulario en el modal
        document.getElementById('numero_documento').style.borderColor = 'black';
        document.getElementById('nombre').style.borderColor = 'black';
        document.getElementById('apellido').style.borderColor = 'black';
        document.getElementById('provincia').style.borderColor = 'black';
        document.getElementById('distrito').style.borderColor = 'black';
        document.getElementById('direccion').style.borderColor = 'black';
        document.getElementById('correo').style.borderColor = 'black';
        document.getElementById('telefono').style.borderColor = 'black';
        document.getElementById('contrasena').style.borderColor = 'black';
        document.getElementById('Rcontrasena').style.borderColor = 'black';
        document.getElementById('id_tipo_doc').style.borderColor = 'black';
        document.getElementById('id_perfil').style.borderColor = 'black';
        document.getElementById('id_estado_usuario').style.borderColor = 'black';


        // Obtener el elemento del modal
        var modalElement = document.getElementById('registrarPersonalModal');
        // Crear una instancia del modal de Bootstrap
        var modal = new bootstrap.Modal(modalElement);
        // Mostrar el modal
        modal.show();

        updateFloatingLabels(true);
    }

}



function abrirModalRegistrar() {
    
    isEditMode = false;

    // Cambiar el texto del botón
    document.getElementById('submitButton').textContent = 'Registrar';

    // Limpiar los campos del formulario
    document.getElementById('personalForm').reset();
    resetForm();
    // Mostrar el modal
    var modalElement = document.getElementById('registrarPersonalModal');
    var modal = new bootstrap.Modal(modalElement);
    modal.show();
    updateFloatingLabels(false);


}

// Función para actualizar la visibilidad de las etiquetas flotantes
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

// Función para ocultar o mostrar etiquetas flotantes basadas en el valor del <select>
function updateFloatingLabel(selectElement) {
    const label = selectElement.nextElementSibling; // Asume que el label sigue al select
    const defaultOption = selectElement.querySelector('option[value=""]');
    if (selectElement.value === defaultOption.value) {
        label.style.display = 'none'; // Oculta la etiqueta si la opción por defecto (vacía) está seleccionada
    } else {
        label.style.display = 'block'; // Muestra la etiqueta si se selecciona una opción válida
    }
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
            fetch(`${apiBaseUrl}/personal/${id}`, {
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
                        confirmButtonText: 'OK'
                    }).then(() => {
                        obtenerPersonal(); // Actualiza la lista después de eliminar
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

