


document.addEventListener('DOMContentLoaded', () => {


    obtenerCategoria();

    document.getElementById('categoriaForm').addEventListener('submit', function (event) {
        event.preventDefault();

        if (isEditMode) {
            Modificar();  // Llamar a la función de modificar
        } else {
            Registrar();  // Llamar a la función de registrar

        }
    });



});



//************************************************************************************************* */

function obtenerCategoria() {

    const tableElement = $('#diseñoTable');

    if ($.fn.DataTable.isDataTable(tableElement)) {
        tableElement.DataTable().destroy();
    }

    fetch(`${apiBaseUrl}/categoria`)
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
                data.sort((a, b) => a.id_cliente - b.Id_categoria);

                data.forEach((categorias, index) => {
                    const row = document.createElement('tr');
                    row.setAttribute('data-id', categorias.Id_categoria);

                    if (index % 2 === 0) {
                        row.classList.add('even');
                    } else {
                        row.classList.add('odd');
                    }

            
                    row.innerHTML = `
                        <td>${categorias.Id_categoria || '--'}</td>
                        <td>${categorias.Nombre || '--'}</td>
                        <td>${categorias.Descripcion || '--'}</td>
                        <td>${categorias.Observaciones || '--'}</td>
                        <td>
                            <button class="btn btn-warning btn-sm edit-btn" onclick="abrirModalEditar(${categorias.Id_categoria})">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                            <button class="btn btn-danger btn-sm delete-btn" onclick="eliminar(${categorias.Id_categoria})">
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
                            targets: [2,3], // Índices de las columnas a ocultar en vistas móviles
                            className: 'hide-mobile'
                        },
                        {
                            targets: [], // Índices de las columnas a ocultar en vistas de escritorio
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
        console.error('La tabla con el ID "diseñoTable" no se encontró en el DOM');
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
            cols[0].textContent,
            cols[1].textContent,
            cols[2].textContent,
            cols[3].textContent,

        ]);
    });

    const props = {
        outputType: "save",
        returnJsPDFDocObject: true,
        fileName: "CategoriaDataReport.pdf",
        orientationLandscape: false,
        compress: true,
        logo: {
            src: "../images/LogoMenu.png",
            width: 53.33,
            height: 26.66,
            margin: { top: 0, left: 0 }
        },
        business: {
            name: "Reporte de las categorias",
            address: "Ferreteria Cristo Nazareno Del Sur",
            phone: "999222333",
            email: "Nestares@correo.com ",
            website: "Fecha : " + new Date().toLocaleDateString(),
        },
        invoice: {
            headerBorder: true,
            tableBodyBorder: true,
            header: [
                { title: "ID", style: { width: 12 } },
                { title: "Categoria", style: { width: 50 } },
                { title: "Descripcion", style: { width: 70 } },
                { title: "Observaciones", style: { width: 60 } },

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
        window.location.href = `${apiBaseUrl}/categoria/exportExcel`;

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
            fetch(`${apiBaseUrl}/categoria/${id}`, {
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
                        obtenerCategoria(); // Actualiza la lista después de eliminar
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
    document.getElementById('modalLabel').textContent = 'Modificar datos del cliente';

    const row = document.querySelector(`#diseñoTable tr[data-id="${id}"]`);

    if (row) {
        // Obtener los valores de la fila y validarlos
        const id_categoria = validateField(row.querySelector('td:nth-child(1)').textContent.trim());
        const nombre = validateField(row.querySelector('td:nth-child(2)').textContent.trim());
        const descripcion = validateField(row.querySelector('td:nth-child(3)').textContent.trim());
        const observaciones = validateField(row.querySelector('td:nth-child(4)').textContent.trim());


        // Asignar los valores validados al formulario
        document.getElementById('id_categoria').value = id_categoria;
        document.getElementById('nombre').value = nombre;
        document.getElementById('descripcion').value = descripcion;
        document.getElementById('observaciones').value = observaciones;
       

        // Aplicar la clase de borde negro a los campos del formulario en el modal
        document.getElementById('id_categoria').style.borderColor = 'black';
        document.getElementById('nombre').style.borderColor = 'black';
        document.getElementById('descripcion').style.borderColor = 'black';
        document.getElementById('observaciones').style.borderColor = 'black';
     

        // Obtener el elemento del modal
        var modalElement = document.getElementById('registrarCategoriaModal');
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
    document.getElementById('categoriaForm').reset();
   /* resetForm();*/
    // Mostrar el modal
    var modalElement = document.getElementById('registrarCategoriaModal');
    var modal = new bootstrap.Modal(modalElement);
    modal.show();
    updateFloatingLabels(false);
    cargarSiguienteId();


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

function cargarSiguienteId() {
    fetch(`${apiBaseUrl}/categoria/obtener`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('id_categoria').value = data.siguienteId;
        })
        .catch(error => console.error('Error:', error));
}

async function Registrar(event) {
    if (event) event.preventDefault(); // Prevenir el envío por defecto



    // Obtener valores de los campos del formulario
    const Id_categoria = document.getElementById('id_categoria').value;
    const Nombre = document.getElementById('nombre').value;
    const Descripcion = document.getElementById('descripcion').value;
    const Observaciones = document.getElementById('observaciones').value;




    // Mostrar cuadro de diálogo de confirmación
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Los datos se registrarán de forma permanente.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar'

    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch(`${apiBaseUrl}/categoria/registrar`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id_categoria: Id_categoria,
                        nombre: Nombre,
                        descripcion: Descripcion,
                        observaciones: Observaciones,
                  
                    })
                });

                const text = await response.text(); // Leer la respuesta como texto
                console.log('Respuesta del servidor:', text); // Imprimir la respuesta para depuración

                if (response.ok) {
                        // Cerrar el modal inmediatamente
                    const modal = bootstrap.Modal.getInstance(document.getElementById('registrarCategoriaModal'));
                    modal.hide();
                    resetForm();
                    updateFloatingLabels(false);
                    obtenerCategoria(); // Actualiza la lista después de guardar
                    cargarSiguienteId();
                    // Mostrar mensaje de éxito después de que el modal se haya cerrado

                    Swal.fire({
                        title: '¡Registros guardados!',
                        text: 'La categoria se guardó exitosamente.',
                        icon: 'success',
                        timer: 1000,               // Tiempo en milisegundos (3000 ms = 3 segundos)
                        showConfirmButton: false    // Ocultar botón de confirmación
                    }).then(() => {
                       
                    });
                } else {
                    Swal.fire('Error', `Error: ${text}`, 'error');
                }
            } catch (error) {
                console.error('Error al enviar la solicitud:', error);
                Swal.fire('Error', 'Error al actualizar la categoria', 'error');
            }
        }
    });
}


async function Modificar(event) {
    if (event) event.preventDefault(); // Prevenir el envío por defecto

    // Mostrar el mensaje de confirmación
    const confirmResult = await Swal.fire({
        title: '¿Estás seguro?',
        text: "¡Se modificará la información del personal!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, modificar',
        cancelButtonText: 'Cancelar'
    });

    if (!confirmResult.isConfirmed) {
        return; // Si el usuario cancela, no hacemos nada
    }

    // Cerrar el modal antes de proceder
    $('#miModal').modal('hide'); // Asegúrate de que el ID del modal coincida con el que estás usando


    
    // Obtener valores de los campos del formulario
    const Id_categoria = document.getElementById('id_categoria').value;
    const Nombre = document.getElementById('nombre').value;
    const Descripcion = document.getElementById('descripcion').value;
    const Observaciones = document.getElementById('observaciones').value;




    try {
        const response = await fetch(`${apiBaseUrl}/categoria/modificar/${Id_categoria}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_categoria: Id_categoria,
                nombre: Nombre,
                descripcion: Descripcion,
                observaciones: Observaciones,
            })
        });

        const text = await response.text(); // Leer la respuesta como texto
        console.log('Respuesta del servidor:', text); // Imprimir la respuesta para depuración

        if (response.ok) {

            const modal = bootstrap.Modal.getInstance(document.getElementById('registrarCategoriaModal'));
            modal.hide();

            resetForm();
            updateFloatingLabels(false);
            obtenerCategoria(); // Actualiza la lista después de guardar
            cargarSiguienteId();
            const result = JSON.parse(text); // Intentar analizar el texto como JSON

            // Mostrar mensaje de éxito después de que el modal se haya cerrado

            Swal.fire({
                title: '¡Datos modificados!',
                text: 'La categoria se modificó exitosamente.',
                icon: 'success',
                timer: 1000,               // Tiempo en milisegundos (3000 ms = 3 segundos)
                showConfirmButton: false    // Ocultar botón de confirmación
            }).then(() => {
            });
        } else {
            Swal.fire('Error', `Error: ${text}`, 'error');
        }
    } catch (error) {
        console.error('Error al enviar la solicitud:', error);
        Swal.fire('Error', 'Error al actualizar la categoria', 'error');
    }
}



function resetForm() {

    // Restablecer los valores de los campos de texto
    document.getElementById('id_categoria').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('observaciones').value = '';

    // Restablecer el color de borde de los campos
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.style.borderColor = ''; // Restablecer el color de borde a su estado original
    });

}

////---- validaciones -->

function validarNumero(input) {
    const value = input.value;
    // Elimina caracteres no numéricos
    const cleaned = value.replace(/[^0-9]/g, '');
    input.value = cleaned;

    // Verifica longitud
    if (cleaned.length >= 1) {
        input.style.borderColor = 'black'; // Color de borde para válido
    } else {
        input.style.borderColor = 'red'; // Color de borde para inválido
    }
}

function validarLetras(input) {
    // Obtiene el valor actual del campo de entrada
    const value = input.value;

    // Reemplaza todo lo que no sea una letra, espacio, o carácter permitido
    const cleaned = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s,. -]/g, '');

    // Actualiza el valor del campo
    input.value = cleaned;

    // Valida si el valor contiene solo letras, espacios, caracteres permitidos y tiene más de 2 caracteres
    const isValid = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s,. -]{3,}$/.test(cleaned);

    // Cambia el borde del campo en función de la validez
    if (isValid) {
        input.style.borderColor = 'black'; // Color de borde para campo válido
    } else {
        input.style.borderColor = 'red'; // Color de borde para campo inválido
    }
}


