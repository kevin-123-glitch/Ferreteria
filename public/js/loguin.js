
document.addEventListener('DOMContentLoaded', () => {
    const signInBtn = document.querySelector("#sign-in-btn");
    const signUpBtn = document.querySelector("#sign-up-btn");
    const container = document.querySelector(".container");

    // Alternar entre modos de inicio de sesión y registro
    signUpBtn.addEventListener("click", () => {
        container.classList.add("sign-up-mode");
    });

    signInBtn.addEventListener("click", () => {
        container.classList.remove("sign-up-mode");
    });

    // Manejar el formulario de inicio de sesión
    const signInForm = document.querySelector('#sign-in-form');
    signInForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const usuario = document.querySelector('#sign-in-usuario').value;
        const contraseña = document.querySelector('#sign-in-contraseña').value;

        try {
            
            const response = await fetch(`${apiBaseUrl}/loguin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Usuario: usuario,
                    Contraseña: contraseña
                }),
            });

            if (response.ok) {
                const user = await response.json();
                // Almacenar los datos del usuario en sessionStorage
                sessionStorage.setItem('user', JSON.stringify(user));
                window.location.href = 'menu.html'; // Redirigir al menú principal

                // Obtener la lista de voces disponibles
                let voices = [];
                function populateVoices() {
                    voices = speechSynthesis.getVoices();
                    // Puede ser necesario esperar a que las voces se carguen
                    if (voices.length === 0) {
                        setTimeout(populateVoices, 100);
                    }
                }
                populateVoices();

                function speakText(text) {
                    const utterance = new SpeechSynthesisUtterance(text);

                    // Selecciona una voz específica (puedes ajustar el nombre de la voz según tus preferencias)
                    const voice = voices.find(v => v.name === 'Google español'); // Ejemplo de nombre de voz
                    if (voice) {
                        utterance.voice = voice;
                    }

                    utterance.lang = 'es-ES'; // Configura el idioma de la voz, por ejemplo, español
                    speechSynthesis.speak(utterance);
                }
                // Convert text to voice
                const fullName = `${user.Nombre} ${user.Apellido}`;
                speakText(`Bienvenido ${fullName}`);

            } else {
                const result = await response.json(); // Asegúrate de que el backend devuelva JSON
                // Mostrar mensaje de error usando SweetAlert
                Swal.fire({
                    icon: 'error',
                    title: 'Error de autenticación',
                    text: result.error || 'Credenciales incorrectas',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error en la solicitud. Por favor, intente nuevamente más tarde.',
                confirmButtonText: 'OK'
            });
        }
    });
});
