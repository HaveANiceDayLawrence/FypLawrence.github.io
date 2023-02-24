FROM node:latest as build

COPY . /mnt

WORKDIR /mnt

RUN npm install
RUN npm install nodemon
RUN npm install ejs
RUN npm install mongoose
RUN npm install multer
RUN npm install dotenv
RUN npm install connect-busboy
# RUN npm install morgoapp.jsn

EXPOSE 3030

CMD ["npm", "run", "build"]
