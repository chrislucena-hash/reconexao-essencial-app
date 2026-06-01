# Teste Fechado - Android

Esta versao React esta empacotada com Capacitor para Android usando:

- Application ID: `com.reconexaoessencial`
- API: `https://api.reconexaoessencial.com.br`
- Artefato exigido pela Play Store: Android App Bundle (`.aab`)

## Assinatura

Se o aplicativo `com.reconexaoessencial` ja existe no Google Play Console, use a
mesma upload key cadastrada. Uma nova chave produz um bundle que o Console recusa,
a menos que seja solicitado o reset da upload key no Play Console.

Coloque o arquivo de chave em `android/upload-key.jks` e crie
`android/key.properties` a partir de `android/key.properties.example`:

```properties
storePassword=senha_da_chave
keyPassword=senha_da_chave
keyAlias=upload
storeFile=../upload-key.jks
```

`key.properties` e os arquivos `.jks` estao ignorados pelo Git.

## Gerar O Bundle

Requer Android Studio/SDK e JDK instalados:

```powershell
npm install
npm run android:bundle
```

O bundle assinado sera criado em:

```text
android/app/build/outputs/bundle/release/app-release.aab
```

Antes de enviar ao teste fechado, confirme que o login Firebase e as chamadas a
API funcionam no aparelho. Recursos Gemini exigem uma integracao segura de backend
antes de receberem uma chave de producao.
