FROM php:8.2-apache

# ── System dependencies ────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
        libcurl4-openssl-dev \
        libonig-dev \
        libsqlite3-dev \
        unzip \
    && docker-php-ext-install \
        curl \
        mbstring \
        pdo \
        pdo_sqlite \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

# ── Composer ───────────────────────────────────────────────────────────────────
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ── Copy application ───────────────────────────────────────────────────────────
WORKDIR /var/www/html/dashboard2
COPY . .

# ── PHP dependencies ───────────────────────────────────────────────────────────
RUN composer install --no-dev --no-interaction --optimize-autoloader --no-progress

# ── Permissions ────────────────────────────────────────────────────────────────
RUN mkdir -p /var/www/html/dashboard2/data \
    && chown -R www-data:www-data /var/www/html/dashboard2 \
    && find /var/www/html/dashboard2 -type d -exec chmod 755 {} \; \
    && find /var/www/html/dashboard2 -type f -exec chmod 644 {} \; \
    && chmod -R 775 /var/www/html/dashboard2/data

EXPOSE 80
CMD ["apache2-foreground"]
