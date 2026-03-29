# MFE-Api-RickandMorty
Microfrontends de la api de Rick and Morty

*Guía de instalación para levantar el proyecto en local------------------------------------------------------------
1.- En los microFrontends de MF-CharacterDetail, MF-Character y MF-Contenedor instala las dependencias de node.
en su terminal correspondiente
#npm i ó npm install

2.- Construye los proyectos anteriormente mencionados en cada terminal correspondiente:
#npm run build:dev.

3.- Para levantar los proyectos y micros cada uno en su terminal correspondiente con:
#npm run preview:dev

NOTA.- La liga del contenedor será a la que accederemos para visualizar la api de Rick and Morty.
NOTA.- Recuerda cambiar la IP por la de tu equipo; de momento la mía es "10.88.177.249", en todo caso puedes acceder.
Recuerda.- Todos los micros tienen que estar levantados y en el contenedor seleccionaras:
# http://localhost:3000/MF-Contenedor/ (ó) http://10.88.177.249:3000/MF-Contenedor/

*Guía de test con Jest--------------------------------------------------------------------------------------------
1.- Para observar los test, coloca en cada terminal de cada microfrontend MF-CharacterDetail, MF-Character y MF-Contenedor
#npm run test

*Guía para crear la imagen en docker-----------------------------------------------------------------------------
utiliza los siguientes comandos en cada terminal
1-. MF-CharacterDetail
# docker build -f .\Docker\Dockerfile --no-cache -t mf-characterdetail:1.0.0 .
2-. MF-MF-Character
# docker build -f .\Docker\Dockerfile --no-cache -t mf-characters:1.0.0 .
3.-MF-Contenedor
# docker build -f .\Docker\Dockerfile --no-cache -t mf-contenedor:1.0.0 .

- Una vez en docker preciona el botón de play y en container name coloca el nombre del microfrontend seleccionado.
-En pots deja el marcado con 80 vasio 8080 con el puerto que corresponde al micro seleccionado:
MF-CharacterDetail: 3002
MF-Character: 3001
MF-Contenedor: 3000

-Una vez levantado los micro frontends en docker podras revisar la vista ingresando a:
# http://localhost:3000/MF-Contenedor/
