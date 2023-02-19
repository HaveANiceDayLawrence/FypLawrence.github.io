FROM node:latest as build

COPY . /mnt

WORKDIR /mnt

RUN npm install
RUN npm install nodemon
RUN npm install ejs
RUN npm install mongoose
# RUN npm install morgon

EXPOSE 4000

CMD ["npm", "run", "serve"]
