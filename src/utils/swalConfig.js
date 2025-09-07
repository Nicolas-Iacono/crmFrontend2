import Swal from 'sweetalert2';

export const showStyledError = (title, text) => {
  return Swal.fire({
    title: title,
    text: text,
    background: '#1e1e2f',
    color: '#fff',
    confirmButtonColor: '#7d4dd4',
    confirmButtonText: 'Atras',
    customClass: {
      popup: 'swal2-popup-custom',
      title: 'swal2-title-custom',
      content: 'swal2-content-custom',
      confirmButton: 'swal2-confirm-button-custom',
    },
  });
};

// También puedes agregar estilos globales en tu archivo CSS principal si es necesario
/*
.swal2-popup-custom {
  border-radius: 15px;
}
.swal2-title-custom {
  font-weight: 600;
}
.swal2-confirm-button-custom {
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: bold;
}
*/
