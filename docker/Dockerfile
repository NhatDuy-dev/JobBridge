FROM node:22-alpine

ENV NODE_ENV=production \
    PORT=3000

WORKDIR /app

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node server.js ./
COPY --chown=node:node src ./src
COPY --chown=node:node database ./database
COPY --chown=node:node html ./html
COPY --chown=node:node css ./css
COPY --chown=node:node js ./js
COPY --chown=node:node assets ./assets

USER node

EXPOSE 3000

CMD ["node", "server.js"]
