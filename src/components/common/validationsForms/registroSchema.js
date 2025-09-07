import * as Yup from 'yup';

function validarCUIT(value) {
    if (!value) return false;
    const limpio = String(value).replace(/[^\d]/g, "");
    if (limpio.length !== 11) return false;
  
    const nums = limpio.split("").map((n) => parseInt(n, 10));
    const coef = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  
    const dvCalculado =
      (11 -
        nums
          .slice(0, 10)
          .reduce((acc, n, i) => acc + n * coef[i], 0) % 11) % 11;
  
    return dvCalculado === nums[10];
  }
  
  export const registroSchema = Yup.object({
    username: Yup.string()
      .trim()
      .min(4, "El username debe tener al menos 4 caracteres")
      .max(30, "Máximo 30 caracteres")
      .matches(/^[a-zA-Z0-9._-]+$/, "Solo letras, números, punto, guion y guion bajo")
      .required("El username es obligatorio"),
  
    password: Yup.string()
      .trim()
      .required("La contraseña es obligatoria")
      .min(4, "La contraseña debe tener al menos 4 caracteres")
      .max(30, "Máximo 30 caracteres"),
  
    nombreNegocio: Yup.string()
      .trim()
      .max(30, "Máximo 30 caracteres")
      .required("La inmobiliaria es obligatoria"),
  
    email: Yup.string()
      .email("Email inválido")
      .required("El email es obligatorio"),
  
    cuit: Yup.string()
      .trim()
      .required("El CUIT es obligatorio")
      .test("formato-cuit", "Formato de CUIT inválido (ej: 20-12345678-1)", (v) =>
        v ? /^[0-9\-]+$/.test(v) : false
      )
      .test("digito-cuit", "CUIT inválido (dígito verificador incorrecto)", validarCUIT),
  
    razonSocial: Yup.string()
      .trim()
      .max(30, "Máximo 30 caracteres")
      .required("La razón social es obligatoria"),
  
    partido: Yup.string()
      .trim()
      .max(30, "Máximo 30 caracteres")
      .required("El partido es obligatorio"),
  
    provincia: Yup.string()
      .trim()
      .max(30, "Máximo 30 caracteres")
      .required("La provincia es obligatoria"),
  
    localidad: Yup.string()
      .trim()
      .max(30, "Máximo 30 caracteres")
      .required("La localidad es obligatoria"),
  
    matricula: Yup.string()
      .trim()
      .max(30, "Máximo 30 caracteres")
      .required("La matrícula es obligatoria"),
  });