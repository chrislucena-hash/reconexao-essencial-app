# Release Android

O frontend React é empacotado com Capacitor usando o identificador
`com.reconexaoessencial`.

## Build local

```bash
cd frontend
npm ci
VITE_API_BASE_URL=https://api.reconexaoessencial.com.br/api/v1 npm run android:sync
cd android
./gradlew bundleRelease
```

O servidor Node usado no ambiente web é compilado separadamente em
`frontend/dist-server`; ele não é incluído no pacote Android.

O bundle será gerado em `frontend/android/app/build/outputs/bundle/release/`.

## Assinatura

Para publicar no Google Play, crie `frontend/android/keystore.properties` a
partir do exemplo e coloque o arquivo de keystore no caminho indicado. Esses
arquivos são locais e não devem ser enviados ao GitHub.

A chave precisa ser a chave de upload da aplicação já cadastrada no Play
Console. Se o aplicativo ainda não tiver sido publicado, a chave pode ser
criada uma única vez antes do primeiro upload.

## API

O build de produção usa `https://api.reconexaoessencial.com.br/api/v1` por
definição. O SSL/TLS do domínio precisa estar configurado no Cloudflare como
Full ou Full (strict); enquanto houver loop de redirecionamento, o app não
conseguirá acessar o backend.
