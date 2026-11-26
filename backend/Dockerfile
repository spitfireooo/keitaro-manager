FROM golang:1.26.3-alpine AS build

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY cmd ./cmd
COPY internal ./internal
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/keitaro-manager ./cmd/api

FROM alpine:3.23 AS runtime

WORKDIR /app
RUN apk add --no-cache ca-certificates
COPY --from=build /out/keitaro-manager /usr/local/bin/keitaro-manager
COPY configs ./configs

USER 65532:65532
EXPOSE 8080
ENTRYPOINT ["keitaro-manager"]
