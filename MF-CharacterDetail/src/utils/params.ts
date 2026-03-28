export const paramsBase = {
  //Variables de entorno
  //NOTA: En Docker debemos poner en la ruta del icono el nombre de la variable nameImage: Ejemplo src={`/nameImage/icons.....`}
  appName: process.env.VITE_APP_NAME || "",
  nameImage: process.env.VITE_NAME_IMAGE || "",
  port: process.env.VITE_PORT || "",
  myIp: process.env.VITE_MYIP || "",
  https: process.env.VITE_HTTPS || "",
};
