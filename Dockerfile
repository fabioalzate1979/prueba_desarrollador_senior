# Usa una imagen base de Node.js
FROM node:20

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia el package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias
RUN npm install --only=production

# Copia el código fuente al contenedor
COPY . .

# Expone el puerto de la aplicación
EXPOSE 8080

# Comando para iniciar la app
CMD ["node", "dist/index.js"]
