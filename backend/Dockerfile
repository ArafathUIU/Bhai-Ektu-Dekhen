FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    libpq-dev \
    postgresql-dev \
    && docker-php-ext-install pdo_pgsql pcntl

WORKDIR /var/www/html

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY . .
RUN composer dump-autoload --no-dev --optimize \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs \
    && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]