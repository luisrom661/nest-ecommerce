# Establecer la imagen base
FROM node:18

# Crear el directorio de la aplicación en el contenedor
WORKDIR /usr/src/app

# Copiar los archivos del paquete y el bloqueo del paquete
COPY package*.json yarn.lock ./

# Instalar las dependencias
RUN yarn install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto en el que se ejecutará la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD [ "yarn", "start" ]