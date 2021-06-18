FROM node:14.16.0

# ARG GITHUB_TOKEN

WORKDIR /cache

COPY package*.json ./

# RUN echo "@auditplus:registry=https://npm.pkg.github.com/ \n \
# //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

RUN npm install

WORKDIR /app
