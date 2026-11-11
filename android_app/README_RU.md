# GroceryStore POS — Android APK

Это Android WebView-приложение открывает кассу по HTTPS в отдельном полноэкранном окне, без адресной строки браузера. Для работы требуется интернет; данные и API остаются на Render-сервисе. Камера выдаётся только странице кассы и используется для видеопотока сканера.

APK подключается к `https://grocery-pos-app-71i1.onrender.com/`. Для изменения сервера отредактируйте `APP_ORIGIN` и `APP_HOST` в `MainActivity.java`, затем пересоберите APK.

## Сборка

Требуются JDK 17, Android SDK Platform 35, Build Tools 35.0.0 и Gradle 8.9. На Windows из этой папки запустите:

```powershell
$env:ANDROID_HOME = 'путь-к-Android-SDK'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:JAVA_HOME = 'путь-к-JDK-17'
gradle assembleDebug
```

Готовый файл появится в `app/build/outputs/apk/debug/app-debug.apk`. Это debug-подписанная сборка для частного тестирования и установки напрямую. Для публикации в магазине приложений потребуется отдельная release-подпись и сохранение ключа подписи.

APK не обходит авторизацию кассы и не включает сервер или базу данных внутрь телефона. Не используйте текущий Render-сервис для настоящих продаж, пока `/health` не сообщает `persistent_storage: true` и не проверена резервная копия.
