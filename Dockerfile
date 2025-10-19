FROM node:24.9.0-alpine3.21

WORKDIR /app

EXPOSE 5173

CMD ["npm", "run", "dev"]
#CMD ["tail", "-f", "/dev/null"]