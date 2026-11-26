# Keitaro Manager

Обёртка над Keitaro Admin API. Создаёт кампанию с геопотоком на Google и потоком с выбранным оффером. Редактор позволяет менять состав офферов, рассчитывает доли и сохраняет черновики в PostgreSQL.

## Запуск в Docker

Нужен Docker Compose v2.20.3+ с поддержкой [`include`](https://docs.docker.com/compose/how-tos/multiple-compose-files/include/). Выполняй команды из корня проекта.

1. Если файла `.env` ещё нет, скопируй настройки командой `Copy-Item .env.example .env` в PowerShell или `cp .env.example .env` в bash.
2. Войди через GitHub на [учебный стенд Keitaro](https://keitaro-for-tests.etolegko.com/admin/). Скопируй ключ кнопкой **«API ключ»** и заполни `KEITARO_API_KEY` в `.env`.
3. Запусти проект.

```powershell
docker compose --env-file .env up -d --build --wait
docker compose --env-file .env ps -a
Invoke-RestMethod http://127.0.0.1:8082/api/ready
```

Запрос готовности через Nginx должен вернуть `status: ready`. Открой `http://127.0.0.1:8082`. Nginx раздаёт React и проксирует `/api/` в Go-контейнер. API также доступен напрямую на `http://127.0.0.1:8080/api`.

| Сервис | Назначение | Порт на хосте |
| --- | --- | --- |
| `frontend` | React и Nginx | `FRONTEND_PORT`, по умолчанию `8082` |
| `backend` | Go API на Fiber | `HTTP_PORT`, по умолчанию `8080` |
| `database` | PostgreSQL | `DB_PORT`, по умолчанию `15433` |
| `migrations` | Одноразовое применение SQL-миграций | — |

Compose ждёт готовности PostgreSQL, запускает миграции и поднимает API после их успешного завершения. Статус `Exited (0)` у `migrations` означает успех. Если порт занят, задай свободный порт в `.env`. Контейнеры внутри сети используют собственные порты.

## Миграции

SQL-файлы находятся в `backend/internal/database/migrations`. При локальной разработке запусти PostgreSQL, примени миграции и проверь их версию.

```powershell
docker compose --env-file .env up -d --wait database
docker compose --env-file .env run --rm migrations
docker compose --env-file .env exec database psql -U keitaro -d keitaro_manager -c "SELECT version, dirty FROM schema_migrations;"
```

Подставь свои `DB_USERNAME` и `DB_NAME`, если изменил их в `.env`. Обычная остановка стека командой `docker compose --env-file .env down` сохраняет данные в Docker-томе.

## Локальная разработка

Подготовь `.env` и запусти PostgreSQL с миграциями, как описано выше. Для локального Go нужны Go 1.26.3 и конфигурация `backend/configs/config.yaml`. Значения из `.env` переопределяют настройки базы и ключ Keitaro. Конфигурация стенда уже содержит ID домена, группы и источника.

В одном терминале запусти API, при необходимости освободив порт `8080`.

```powershell
cd backend
go run ./cmd/api
```

Во втором терминале из корня проекта запусти React. Для фронтенда используй Node.js 24 и pnpm 10.

```powershell
cd frontend
pnpm install --frozen-lockfile
pnpm dev
```

Vite работает на `http://127.0.0.1:1422` и проксирует запросы к API на `127.0.0.1:8080`.

## Проверка на стенде

1. Создай кампанию в интерфейсе, указав, например, код страны `GM` и активный оффер.
2. На странице кампании проверь два потока. В админке Keitaro у первого потока проверь фильтр `GM` и переход на Google. У второго проверь исходный оффер с долей 100%.
3. Открой редактор второго потока. Добавь ещё один оффер, опубликуй и проверь доли 50/50. Удали добавленный оффер, снова опубликуй и проверь долю 100% у оставшегося. Запросы к стенду видны в разделе «Журнал» в Keitaro.

## Windows x64

Десктоп устанавливается отдельно и подключается к API на `127.0.0.1:8080`. [Инструкция по сборке установщика](frontend/README.md#установщик-windows-x64) находится в README фронтенда.

Для кнопки скачивания в Docker собери установщик командой `pnpm desktop:download` из `frontend` перед сборкой образа. Для опубликованного установщика укажи его прямой адрес в `VITE_DESKTOP_DOWNLOAD_URL` в корневом `.env`. После этого пересобери образ фронтенда.

```powershell
docker compose --env-file .env up -d --build frontend
```
