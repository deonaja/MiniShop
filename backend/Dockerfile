# Backend image for Railway (Laravel 11 + PostgreSQL)
FROM php:8.4-cli

# System deps + PHP extensions needed to talk to PostgreSQL
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev unzip git \
    && docker-php-ext-install pdo pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Railway injects $PORT. Run pending migrations + seed (idempotent), then serve.
CMD php artisan migrate --force --seed \
    && php artisan serve --host 0.0.0.0 --port ${PORT:-8000}
