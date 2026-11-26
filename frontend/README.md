# Keitaro Manager

Интерфейс на React для браузера и Windows. Для работы нужен запущенный Go API на `127.0.0.1:8080` с доступом к PostgreSQL и Keitaro.

```powershell
pnpm install
pnpm dev
```

Веб-интерфейс откроется по адресу `http://127.0.0.1:1422`. Для разработки в окне Tauri используется `pnpm tauri dev`.

## Установщик Windows x64

Для сборки нужны Rust с целью `x86_64-pc-windows-msvc` и инструменты сборки Tauri для Windows.

```powershell
pnpm desktop:download
pnpm build
```

Первая команда собирает NSIS-установщик и копирует его в `frontend/public/downloads/Keitaro-Manager-Setup-x64.exe`. Вторая собирает веб-версию с кнопкой скачивания. Для dev-режима после появления установщика перезапусти Vite. Установщик включает интерфейс Tauri. Go API и PostgreSQL запускаются отдельно.

Если установщик уже опубликован, задай его прямой HTTP(S)-адрес в `VITE_DESKTOP_DOWNLOAD_URL` перед сборкой веб-версии.

Иконка веб- и десктопной версий использует символ [Route из Lucide](https://lucide.dev/icons/route). Исходник находится в `src/assets/app-icon.svg`. Для генерации файлов Tauri используется `pnpm tauri icon src/assets/app-icon.svg`. [Лицензия Lucide](public/third-party-licenses/lucide.txt)
