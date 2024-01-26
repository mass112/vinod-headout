# ---- Base Node ----
FROM node:14 AS base
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# ---- Build ARM ----
FROM base AS arm
COPY . .
EXPOSE 8080
RUN npm run build
CMD [ "node", "app.js" ]
CMD ["--memory=1500m", "--cpus=2"]

# ---- Build x86 ----
FROM base AS x86
COPY . .
EXPOSE 8080
RUN npm run build
CMD [ "node", "app.js" ]
CMD ["--memory=1500m", "--cpus=2"]

# ---- Release ----
FROM scratch AS release
COPY --from=arm /usr/src/app /usr/src/app
CMD [ "node", "app.js" ]
CMD ["--memory=1500m", "--cpus=2"]
