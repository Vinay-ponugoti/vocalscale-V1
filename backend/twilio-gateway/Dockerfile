FROM golang:1.24-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git

WORKDIR /app

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build application with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -installsuffix cgo -o gateway ./cmd/gateway/main.go

# Production stage
FROM alpine:3.19

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata wget && \
    update-ca-certificates && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/gateway .

# Set proper permissions
RUN chown -R appuser:appuser /app

# Use non-root user
USER appuser

EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8081/health || exit 1

# Resource limits (recommended for container runtime, not enforced here)
# Memory: 512MB, CPU: 0.5 (set in docker-compose or k8s)
CMD ["./gateway"]
