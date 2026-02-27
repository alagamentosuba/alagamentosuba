# Usa uma imagem oficial completa do Node.js (Evita conflitos de C++ do SQLite no Alpine)
FROM node:20

# Define o diretório de trabalho dentro do container (Longe da pasta /app que causou colisão)
WORKDIR /var/www

# Instala as dependências do sistema operacional necessárias para o Puppeteer rodar o Chromium Headless no Linux
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    libnss3 \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Copia os arquivos de dependência primeiro para aproveitar o cache do Docker
COPY package.json package-lock.json ./

# Instala as dependências exatas
RUN npm ci

# Copia todo o código fonte para dentro do container
COPY . .

# Comando para iniciar o servidor
CMD ["npm", "start"]
