


document.addEventListener('DOMContentLoaded', () => {



    obtenerProducto();
    Combo_categoria();
    Combo_marca();
    Combo_unidad();
});


function Combo_categoria() {
    fetch(`${apiBaseUrl}/producto/Combo_categoria`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar datos');
            }
            return response.json();
        })
        .then(data => {
            const select = document.getElementById('id_categoria');
            select.innerHTML = '<option value="" disabled selected>Selecciona un categoria</option>'; // Limpia y agrega opción inicial
            data.forEach(categorias => {
                const option = document.createElement('option');
                option.value = categorias.Id_categoria;
                option.textContent = categorias.Nombre;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error al obtener la categoria:', error));
}

function Combo_marca() {
    fetch(`${apiBaseUrl}/producto/Combo_marca`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar datos');
            }
            return response.json();
        })
        .then(data => {
            const select = document.getElementById('id_marca');
            select.innerHTML = '<option value="" disabled selected>Selecciona un marca</option>'; // Limpia y agrega opción inicial
            data.forEach(marca => {
                const option = document.createElement('option');
                option.value = marca.Id_marca;
                option.textContent = marca.Nombre;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error al obtener la marca:', error));
}

function Combo_unidad() {
    fetch(`${apiBaseUrl}/producto/Combo_unidad`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar datos');
            }
            return response.json();
        })
        .then(data => {
            const select = document.getElementById('id_unidad');
            select.innerHTML = '<option value="" disabled selected>Selecciona la unidad de medida</option>'; // Limpia y agrega opción inicial
            data.forEach(unidades_medida => {
                const option = document.createElement('option');
                option.value = unidades_medida.Id_unidad;
                option.textContent = unidades_medida.Nombre;
                select.appendChild(option);
            });
        })
        .catch(error => console.error('Error al obtener la unidad:', error));
}

function cargarSiguienteId() {
    fetch(`${apiBaseUrl}/producto/obtener`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('id_producto').value = data.siguienteId;
        })
        .catch(error => console.error('Error:', error));
}
/*

//************************************************************************************************* */

function obtenerProducto() {

    const tableElement = $('#diseñoTable');

    if ($.fn.DataTable.isDataTable(tableElement)) {
        tableElement.DataTable().destroy();
    }

    fetch(`${apiBaseUrl}/producto`)
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
                data.sort((a, b) => a.Id_producto - b.Id_producto);

                data.forEach((productos, index) => {
                    const row = document.createElement('tr');
                    row.setAttribute('data-id', productos.Id_producto);

                    if (index % 2 === 0) {
                        row.classList.add('even');
                    } else {
                        row.classList.add('odd');
                    }
                    // Convertir stock y stock mínimo a números para comparación
                    const stock = Number(productos.Stock);
                    const stockMinimo = Number(productos.Stock_minimo);

                    if (productos.Stock !== null && productos.Stock !== '' && productos.Stock <= productos.Stock_minimo && productos.Stock >= 0) {
                        row.classList.add('warning'); // Agregar clase de advertencia
                    }


                    row.innerHTML = `
                    <td>${productos.Id_producto || 'No definido'}</td>
                    <td>${productos.Codigo_barras || 'No definido'}</td>
                    <td>${productos.categoria || 'No definido'}</td>
                    <td>${productos.marca || 'No definido'}</td>
                    <td>${productos.Unidad || 'No definido'}</td>
                    <td>${productos.Nombre_Producto || 'No definido'}</td>
                    <td>${productos.Descripcion_Producto || '--'}</td>
                    <td>${productos.Precio_C || ''}</td>
                    <td>${productos.Precio_V || ''}</td>
                    <td>${productos.Stock || ''}</td>
                    <td>${productos.Stock_minimo || ''}</td>
                    <td>${productos.Stock_maximo || ''}</td>
                    <td>${productos.Ubicacion || '--'}</td>
                    <td>${productos.Fecha_caducidad || '--'}</td>
                    <td>${productos.Url_foto || '--'}</td>


                    <td>
                        <button class="btn btn-warning btn-sm edit-btn" onclick="abrirModalEditar(${productos.Id_producto})">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-btn" onclick="eliminar(${productos.Id_producto})">
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
                            targets: [0, 2, 3, 4, 6, 10, 11, 12, 13, 14], // Índices de las columnas a ocultar en vistas móviles
                            className: 'hide-mobile'
                        },
                        {
                            targets: [0, 6, 12, 14], // Índices de las columnas a ocultar en vistas de escritorio
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
            cols[1].textContent,
            cols[2].textContent,
            cols[3].textContent,
            cols[4].textContent,
            cols[5].textContent,
            cols[7].textContent,
            cols[8].textContent,
            cols[9].textContent,
            cols[12].textContent,


        ]);
    });

    const props = {
        outputType: "save",
        returnJsPDFDocObject: true,
        fileName: "ProductoDataReport.pdf",
        orientationLandscape: true,
        compress: true,
        logo: {
            src: "../images/LogoMenu.png",
            width: 53.33,
            height: 26.66,
            margin: { top: 0, left: 0 }
        },
        business: {
            name: "Reporte de los productos",
            address: "Ferreteria Cristo Nazareno Del Sur",
            phone: "999222333",
            email: "Nestares@correo.com ",
            website: "Fecha : " + new Date().toLocaleDateString(),
        },
        invoice: {
            headerBorder: true,
            tableBodyBorder: true,
            header: [
                { title: "Codigo de barras", style: { width: 30 } },
                { title: "Categoria", style: { width: 50 } },
                { title: "Marca", style: { width: 37 } },
                { title: "Unidad", style: { width: 28 } },
                { title: "Producto", style: { width: 45 } },
                { title: "Prec.Compra", style: { width: 24 } },
                { title: "Prec.Venta", style: { width: 24 } },
                { title: "Stock", style: { width: 12 } },
                { title: "Ubicacion", style: { width: 27 } },

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
        window.location.href = `${apiBaseUrl}/producto/exportExcel`;

    });
}




function abrirModalEditar(id) {

    isEditMode = true;

    // Cambiar el texto del botón
    document.getElementById('submitButton').textContent = 'Guardar Cambios';
    document.getElementById('modalLabel').textContent = 'Modificar datos del personal';

    const row = document.querySelector(`#diseñoTable tr[data-id="${id}"]`);


    if (row) {
        const Id_producto = row.querySelector('td:nth-child(1)').textContent.trim();
        const Codigo_barras = row.querySelector('td:nth-child(2)').textContent.trim();
        const Id_categoria = row.querySelector('td:nth-child(3)').textContent.trim();
        const Id_marca = row.querySelector('td:nth-child(4)').textContent.trim();
        const Id_unidad = row.querySelector('td:nth-child(5)').textContent.trim();
        const Nombre = row.querySelector('td:nth-child(6)').textContent.trim();
        const Descripcion = row.querySelector('td:nth-child(7)').textContent.trim();
        const Precio_C = row.querySelector('td:nth-child(8)').textContent.trim();
        const Precio_V = row.querySelector('td:nth-child(9)').textContent.trim();
        const Stock_minimo = row.querySelector('td:nth-child(11)').textContent.trim();
        const Stock_maximo = row.querySelector('td:nth-child(12)').textContent.trim();
        const Ubicacion = row.querySelector('td:nth-child(13)').textContent.trim();
        const Fecha_caducidad = row.querySelector('td:nth-child(14)').textContent.trim();
        const Url_foto = row.querySelector('td:nth-child(15)').textContent.trim();



        // document.getElementById('id_tipo_doc').value = documetoIdentidad || '';
        document.getElementById('id_producto').value = Id_producto || '';
        document.getElementById('codigo_barras').value = Codigo_barras || '';
        document.getElementById('id_categoria').value = Id_categoria || '';
        document.getElementById('id_marca').value = Id_marca || '';
        document.getElementById('id_unidad').value = Id_unidad || '';
        document.getElementById('nombre').value = Nombre || '';
        document.getElementById('descripcion').value = Descripcion || '';
        document.getElementById('precio_c').value = Precio_C || '';
        document.getElementById('precio_v').value = Precio_V || '';
        document.getElementById('stock_minimo').value = Stock_minimo || '';
        document.getElementById('stock_maximo').value = Stock_maximo || '';
        document.getElementById('ubicacion').value = Ubicacion || '';
        document.getElementById('fecha_caducidad').value = Fecha_caducidad || '';
        document.getElementById('url_foto').value = Url_foto || '';


        // Establecer el valor del combo box basado en el nombre
        const tipoDocSelect = document.getElementById('id_categoria');
        for (let option of tipoDocSelect.options) {
            if (option.textContent.trim() === Id_categoria) {
                tipoDocSelect.value = option.value;
                break;
            }
        }
        // Establecer el valor del combo box basado en el nombre
        const tipoPerSelect = document.getElementById('id_marca');
        for (let option of tipoPerSelect.options) {
            if (option.textContent.trim() === Id_marca) {
                tipoPerSelect.value = option.value;
                break;
            }
        }
        // Establecer el valor del combo box basado en el nombre
        const tipoEstadoSelect = document.getElementById('id_unidad');
        for (let option of tipoEstadoSelect.options) {
            if (option.textContent.trim() === Id_unidad) {
                tipoEstadoSelect.value = option.value;
                break;
            }
        }
        // Aplicar la clase de borde verde a los campos del formulario en el modal
        document.getElementById('codigo_barras').style.borderColor = 'black';
        document.getElementById('id_categoria').style.borderColor = 'black';
        document.getElementById('id_marca').style.borderColor = 'black';
        document.getElementById('id_unidad').style.borderColor = 'black';
        document.getElementById('nombre').style.borderColor = 'black';
        document.getElementById('descripcion').style.borderColor = 'black';
        document.getElementById('precio_c').style.borderColor = 'black';
        document.getElementById('precio_v').style.borderColor = 'black';
        document.getElementById('stock_minimo').style.borderColor = 'black';
        document.getElementById('stock_maximo').style.borderColor = 'black';
        document.getElementById('ubicacion').style.borderColor = 'black';
        document.getElementById('fecha_caducidad').style.borderColor = 'black';
        document.getElementById('url_foto').style.borderColor = 'black';


        // Obtener el elemento del modal
        var modalElement = document.getElementById('registrarProductoModal');
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
    document.getElementById('productoForm').reset();
    /*resetForm();*/
    // Mostrar el modal
    var modalElement = document.getElementById('registrarProductoModal');
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
            fetch(`${apiBaseUrl}/producto/${id}`, {
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
                        showConfirmButton: false    // Ocultar botón de confirmación                    }).then(() => {

                    }).then(() => {
                        obtenerProducto(); // Actualiza la lista después de eliminar
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

