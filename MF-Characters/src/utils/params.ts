export const paramsBase = {
  //Variables de entorno
  //NOTA: En Docker debemos poner en la ruta del icono el nombre de la variable nameImage: Ejemplo src={`/nameImage/icons.....`}
  appName: process.env.VITE_APP_NAME || "",
  nameImage: process.env.VITE_NAME_IMAGE || "",

  //IP para endpoint
//   ipPuertoMenu: process.env.VITE_IPPUERTO_MENU || "",
//   ipPuertoIncapacidades: process.env.VITE_IPPUERTO_INCAPACIDADES || "",
};