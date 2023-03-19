FROM node:14 as build

COPY . ./app
RUN rm -rf node_modules package-lock.json

WORKDIR /app

RUN npm install morgan && \
npm install express && \
npm install nodemon && \
npm install ejs && \
npm install mongoose && \
npm install multer && \
npm install dotenv && \
npm install path && \
npm install fs && \
npm install child_process && \
npm install form-data && \
npm install axios && \
npm install alert


EXPOSE 3030

CMD ["npm", "run", "build"]

# RUN npm install
# RUN npm install nodemon
# RUN npm install ejs
# RUN npm install mongoose
# RUN npm install multer
# RUN npm install dotenv
# # RUN npm install morgoapp.jsn

