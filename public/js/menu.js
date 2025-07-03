 document.addEventListener('DOMContentLoaded', () => {
    // Selecciona el enlace del menú "Tablero Principal"
    const defaultMenu = document.querySelector('[data-target="menuprincipal"]');
    
    // Marca el menú "Tablero Principal" como activo
    if (defaultMenu) {
        defaultMenu.classList.add('active');
        // Cargar el contenido por defecto
        loadContent('unidad.html');
    }
});


const sidebar = document.querySelector('.sidebar');
const contentFrame = document.getElementById('contentFrame');

sidebar.addEventListener('mouseenter', () => {
    sidebar.classList.add('expanded');
    contentFrame.style.marginLeft = '10px'; // Ajusta el margen cuando la barra lateral está expandida
});

sidebar.addEventListener('mouseleave', () => {
    sidebar.classList.remove('expanded');
    contentFrame.style.marginLeft = '10px'; // Ajusta el margen cuando la barra lateral está colapsada
    // Contraer los submenús al colapsar el menú
    document.querySelectorAll('.sub-menu').forEach(subMenu => {
        subMenu.classList.remove('active');
        subMenu.style.height = '0'; // Ajustar altura del submenú
    });
});

function handleMenuClick(link) {
    const target = link.getAttribute('data-target');
    const subMenu = link.nextElementSibling;

    // Desmarcar otros enlaces y cerrar otros submenús
    document.querySelectorAll('.nav-link').forEach(navLink => {
        if (navLink !== link) {
            navLink.classList.remove('active');
            const otherSubMenu = navLink.nextElementSibling;
            if (otherSubMenu) {
                otherSubMenu.classList.remove('active');
                otherSubMenu.style.height = '0'; // Ajustar altura del submenú
                navLink.querySelector('.right-arrow').classList.remove('down');
            }
        }
    });

    if (!subMenu || !subMenu.classList.contains('sub-menu')) {
        const { contentUrl } = getMenuConfig(target);

        loadContent(contentUrl);
    } else {
        // Toggle el submenú
        subMenu.classList.toggle('active');
        subMenu.style.height = subMenu.classList.contains('active') ? 'auto' : '0'; // Ajustar altura del submenú
        link.querySelector('.right-arrow').classList.toggle('down'); // Cambiar la clase a "down"
    }

    // Activar el enlace seleccionado
    link.classList.add('active');
}

function handleSubMenuClick(link) {
    const target = link.getAttribute('data-target');
    const { contentUrl } = getMenuConfig(target);

    loadContent(contentUrl);

    // Desactivar otros submenús
    document.querySelectorAll('.sub-menu .nav-link').forEach(subMenuLink => {
        if (subMenuLink !== link) {
            subMenuLink.classList.remove('active');
        }
    });

    // Activar el submenú seleccionado
    link.classList.add('active');
}

function loadContent(url) {
    contentFrame.src = url;
}

function getMenuConfig(target) {
    switch (target) {
        case 'menuprincipal':
            return { contentUrl: 'unidad.html' };

        case 'Personal':
            return { contentUrl: 'personal.html' };

        case 'Cliente':
            return { contentUrl: 'cliente.html' };

        case 'Proveedor':
            return { contentUrl: 'proveedor.html' };

        case 'Articulos':
            return { contentUrl: 'producto.html' };

        case 'Categorias':
            return { contentUrl: 'categoria.html' };

        case 'Marcas':
            return { contentUrl: 'marca.html' };

        case 'Unidad':
            return { contentUrl: 'unidad.html' };

        default:
            return { contentUrl: 'ss.html' };
    }
}
 