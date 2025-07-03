$(document).ready(function () {

    let tipoDocumentoSeleccionado = '';
    // Escucha cuando cambia el tipo de documento
    document.getElementById('selDocumentoVenta').addEventListener('change', function () {
        tipoDocumentoSeleccionado = this.value;

        if (tipoDocumentoSeleccionado) {
            // Obtener la serie y número de documento al seleccionar un tipo de documento
            fetch(`${apiBaseUrl}/venta/serie/${tipoDocumentoSeleccionado}`)

                .then(response => response.json())
                .then(data => {
                    if (data.serie && data.ultimoNumeroDocumento) {
                        document.getElementById('iptNroSerie').value = data.serie;
                        document.getElementById('iptNroVenta').value = data.ultimoNumeroDocumento;
                    } else {
                        console.error('No se encontraron datos para el documento seleccionado');
                        document.getElementById('iptNroSerie').value = '';
                        document.getElementById('iptNroVenta').value = '';
                    }
                })
                .catch(error => {
                    console.error('Error al obtener los datos:', error);
                    document.getElementById('iptNroSerie').value = '';
                    document.getElementById('iptNroVenta').value = '';
                });
        } else {
            document.getElementById('iptNroSerie').value = '';
            document.getElementById('iptNroVenta').value = '';
        }
    });


    var igvTasa = 0.18; // Tasa de IGV (18%)

    var tableElement = $('#diseñoTable').DataTable({
        pageLength: 10,
        lengthMenu: [5, 10, 15, 20, 100, 200, 500],
        columnDefs: [
            {
                targets: [1, 2, 7, 8], // Índices de las columnas a ocultar en vistas móviles
                className: 'hide-mobile'
            },
            {
                targets: [1], // Índices de las columnas a ocultar en vistas de escritorio
                className: 'hide-computer'
            }
        ],
        language: {
            lengthMenu: "Mostrar _MENU_ registros por página",
            zeroRecords: "Ningún registro encontrado",
            info: "Mostrando de (_START_ a _END_) de un total de _TOTAL_ registros",
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

    $('#search-input').on('input', function () {
        var termino = $(this).val();
        if (termino.length > 1) {
            fetchSuggestions(termino);
        } else {
            limpiarSugerencias();
        }
    });

    $('#search-input').on('keypress', function (e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            var termino = $(this).val();
            if (termino.length > 1) {
                fetchSuggestions(termino, true); // Pasar true para manejar Enter

            }
        }
    });

    function fetchSuggestions(termino, autoSelect = false) {
        fetch(`${apiBaseUrl}/venta/buscarProducto?q=${encodeURIComponent(termino)}`)

            .then(response => response.json())
            .then(data => {
                mostrarSugerencias(data, autoSelect);
            })
            .catch(error => console.error('Error en la solicitud de búsqueda:', error));
    }

    function mostrarSugerencias(productos, autoSelect) {
        var sugerencias = $('#suggestions');
        sugerencias.empty();
        if (productos.length > 0) {
            productos.forEach(producto => {
                var item = $('<li class="list-group-item"></li>').text(producto.Nombre);
                item.on('click', () => seleccionarProducto(producto));
                sugerencias.append(item);


            });
            sugerencias.show();

            if (autoSelect && productos.length === 1) {
                seleccionarProducto(productos[0]);

            }
        } else {

            sugerencias.hide();
        }
    }

    function limpiarSugerencias() {
        $('#suggestions').empty().hide();

    }
    // Evento para capturar la entrada del usuario
    $('#cliente-input').on('input', function () {
        var termino = $(this).val();
        if (termino.length > 1) {
            fetchSuggestionsCliente(termino); // Llamar a la función para obtener sugerencias
        } else {
            limpiarSugerenciasCliente(); // Limpiar sugerencias si no hay suficiente texto
        }
    });

    // Evento para manejar el Enter como una búsqueda
    $('#cliente-input').on('keypress', function (e) {
        if (e.which === 13) { // Si el usuario presiona Enter
            e.preventDefault();
            var termino = $(this).val();
            if (termino.length > 1) {
                fetchSuggestionsCliente(termino, true); // Forzar la selección si solo hay un resultado
            }
        }
    });

    // Función para hacer la solicitud de búsqueda al servidor
    function fetchSuggestionsCliente(termino, autoSelect = false) {
        fetch(`${apiBaseUrl}/venta/buscarCliente?q=${encodeURIComponent(termino)}`)

            .then(response => response.json()) // Convertir la respuesta en JSON
            .then(data => {
                mostrarSugerenciasCliente(data, autoSelect); // Mostrar sugerencias en la lista
            })
            .catch(error => console.error('Error en la solicitud de búsqueda:', error)); // Manejo de errores
    }

    function mostrarSugerenciasCliente(clientes, autoSelect) {
        var sugerencias = $('#suggestionscliente');
        sugerencias.empty(); // Vaciar la lista de sugerencias anteriores

        if (clientes.length > 0) {
            clientes.forEach(cliente => {
                var item = $('<li class="list-group-item"></li>')
                    .text(`${cliente.Datos_cliente} - ${cliente.Numero_documento}`)
                    .data('cliente', cliente); // Asociar el objeto proveedor al ítem

                item.on('click', () => seleccionarCliente(cliente)); // Seleccionar proveedor al hacer clic
                sugerencias.append(item); // Añadir el item a la lista de sugerencias
            });
            sugerencias.show(); // Mostrar la lista de sugerencias

            if (autoSelect && clientes.length === 1) {
                seleccionarCliente(clientes[0]); // Seleccionar automáticamente si hay un único resultado
            }
        } else {
            sugerencias.hide(); // Ocultar sugerencias si no hay resultados
        }
    }


    // Función para limpiar las sugerencias
    function limpiarSugerenciasCliente() {
        $('#suggestionscliente').empty().hide(); // Vaciar y ocultar la lista de sugerencias
    }

    // Función para manejar la selección de un proveedor
    function seleccionarCliente(cliente) {
        $('#cliente-input').val(`${cliente.Datos_cliente} - ${cliente.Numero_documento}`); // Poner el nombre del proveedor en el campo de texto*/
        $('#Id_obtenido_cliente').val(`${cliente.id_cliente}`); // Poner el id_proveedor en el campo de texto

        limpiarSugerenciasCliente(); // Limpiar sugerencias una vez seleccionado
    }


    function seleccionarProducto(producto) {
        $('#search-input').val('');
        $('#product-id').val(producto.Id_producto);
        $('#product-code').val(producto.Codigo_barras);
        $('#product-name').val(producto.Nombre);
        $('#product-price').val(producto.Precio_V);
        $('#product-stock').val(producto.Stock);
        limpiarSugerencias();

        var existingRow = tableElement
            .rows()
            .nodes()
            .to$()
            .find(`td:eq(1):contains(${producto.Id_producto})`);

        if (existingRow.length > 0) {
            actualizarCantidad(existingRow, producto);

        } else {
            agregarProducto(producto);
            actualizarTotal(); // Aquí se llama a actualizarTotal


        }


    }


    function actualizarCantidad(existingRow, producto) {
        var cantidadInput = existingRow.closest('tr').find('.cantidad-input');
        var descuentoInput = existingRow.closest('tr').find('.descuento-input');
        var currentQuantity = parseFloat(cantidadInput.val());
        var newQuantity = currentQuantity + 1;

        cantidadInput.val(newQuantity);
        actualizarImporte(existingRow.closest('tr'), producto);
        actualizarTotal(); // Actualiza el total después de cambiar la cantidad
    }

    function agregarProducto(producto) {

        var cantidad = 1; // Cantidad predeterminada
        var descuento = 0; // Descuento predeterminado
        var importe = producto.Precio_V * cantidad;
        var importeConDescuento = calcularImporteConDescuento(importe, descuento);

        var rowNode = tableElement.row.add([
            '', // Inicialmente vacío, será actualizado en `redibujarFila`
            producto.Id_producto,
            producto.Codigo_barras,
            producto.Nombre,
            `<td class="columna">
                <input type="number"  class="form-control form-control-sm cantidad-input" value="${cantidad}" min="1">
            </td>`,
            producto.Precio_V,
            importeConDescuento.toFixed(2),
            producto.Unidad,
            producto.Marca,
            `<td class="columna">
              <input type="number"  class="form-control form-control-sm descuento-input" value="${descuento}" min="0" max="100">
            </td>`,
            '<button class="btn btn-danger btn-sm delete-btn btn-delete"><i class="fas fa-trash"></i></button>'
        ]).draw().node();

        // Actualiza el importe cuando se cambia la cantidad
        $(rowNode).find('.cantidad-input').on('input', function () {
            actualizarImporte(rowNode, producto);
        });

        // Actualiza el importe cuando se cambia el descuento
        $(rowNode).find('.descuento-input').on('input', function () {
            actualizarImporte(rowNode, producto);
        });

        redibujarFila(); // Actualiza los números de las filas después de eliminar

    }

    $('#descuentoGeneral').on('input', function () {
        actualizarTotal(); // Actualiza el total cuando se cambia el descuento global
    });


    function actualizarImporte(rowNode, producto) {
        var cantidad = parseFloat($(rowNode).find('.cantidad-input').val()) || 1;
        var descuento = parseFloat($(rowNode).find('.descuento-input').val()) || 0;
        var importe = producto.Precio_V * cantidad;
        var importeConDescuento = calcularImporteConDescuento(importe, descuento);
        $(rowNode).find('td').eq(6).text(importeConDescuento.toFixed(2));
        actualizarTotal(); // Actualiza el total después de cambiar el importe
    }

    function calcularImporteConDescuento(importe, descuento) {
        return importe * (1 - descuento / 100);
    }

    function redibujarFila() {
        tableElement.rows().every(function (rowIdx, tableLoop, rowLoop) {
            $(this.node()).find('td:eq(0)').text(rowIdx + 1); // Actualiza la numeración
        });
    }

    function actualizarTotal() {
        var subtotal = 0;

        // Recorre las filas de la tabla y suma el importe
        tableElement.rows().every(function () {
            var importe = parseFloat($(this.node()).find('td').eq(6).text()) || 0;
            subtotal += importe;
        });

        // Obtén el descuento global
        var descuentoGlobal = parseFloat($('#descuentoGeneral').val()) || 0;

        // Calcula el importe con descuento
        var subtotalConDescuento = calcularImporteConDescuento(subtotal, descuentoGlobal);

        // Calcula el IGV (Impuesto General a las Ventas)
        var igv = subtotal * igvTasa;

        // Calcula el total con IGV y el descuento aplicado
        var total = subtotal + igv;
        var totalConDescuento = subtotalConDescuento + igv;

        // Calcula el monto descontado
        var montoDescontado = total - totalConDescuento;

        // Actualiza los valores en el HTML
        $('#subtotal').text(subtotal.toFixed(2));
        $('#subtotal2').text(subtotal.toFixed(2)); // Asegúrate de agregar este elemento en tu HTML
        $('#igv').text(igv.toFixed(2)); // Asegúrate de tener un elemento con id "igv" para mostrar IGV
        $('#total_descuento').text(montoDescontado.toFixed(2)); // Monto descontado
        $('#total').text(totalConDescuento.toFixed(2)); // Total con descuento aplicado
    }

    // Función para calcular el importe con descuento
    function calcularImporteConDescuento(subtotal, descuento) {
        return subtotal - (subtotal * (descuento / 100));
    }


    $('#diseñoTable').on('click', '.btn-delete', function () {
        tableElement.row($(this).parents('tr')).remove().draw();
        actualizarTotal(); // Actualiza el total después de eliminar una fila
    });

});
