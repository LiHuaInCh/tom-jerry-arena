# 打包 Android APK

项目已经用 Capacitor 6 生成好 `android/` 工程，Web 资源在 `www/`，同步命令：

```bash
npm install
npm run pack        # 重新生成 www
npx cap sync android
```

## 方式一：Android Studio（最简单）

1. 安装 Android Studio（自带 SDK 和 Gradle）
2. 打开本项目的 `android/` 目录
3. 等待 Gradle 同步，菜单 **Build → Build Bundle(s) / APK(s) → Build APK(s)**
4. APK 输出在 `android/app/build/outputs/apk/debug/app-debug.apk`

## 方式二：命令行（需要 Android SDK）

1. 安装 Android SDK（platform-tools、platforms;android-34、build-tools;34.0.0）
2. 设置环境变量 `ANDROID_HOME` 指向 SDK 目录
3. 运行：

```bash
npm run pack
npx cap sync android
cd android
gradlew.bat assembleDebug
```

## 方式三：GitHub Actions（无需本地 SDK）

1. 把项目推到 GitHub 仓库
2. 仓库的 **Actions** 会自动运行 `Build Android APK`
3. 构建完成后在运行详情页下载 `tomjerry-debug-apk` 产物

工作流文件：`.github/workflows/build-apk.yml`

## 发布正式版

- 在 `android/app/build.gradle` 配置 `signingConfigs`，用 keystore 签名
- 运行 `gradlew assembleRelease`
- 生成 `android/app/build/outputs/apk/release/app-release.apk`

## 配置

- 应用 ID：`com.fan.tomjerry`
- 应用名：猫鼠大作战
- Web 目录：`www/`
- 配置见 `capacitor.config.json`
