# Release Android

O frontend React é empacotado com Capacitor usando o identificador
`com.reconexaoessencial`.

## Build local

```bash
npm ci
VITE_API_BASE_URL=https://api.reconexaoessencial.com.br/api/v1 python3 scripts/verify_mobile_backend.py
VITE_API_BASE_URL=https://api.reconexaoessencial.com.br/api/v1 npm run android:sync
cd android
./gradlew bundleRelease
```

O servidor Node usado no ambiente web é compilado separadamente em
`dist/server.cjs`; ele não é incluído no pacote Android.

O bundle será gerado em `android/app/build/outputs/bundle/release/`.

O workflow **Android Release** também gera um APK de release assinado em
`android/app/build/outputs/apk/release/app-release.apk`. Ele valida o fundo claro
`#F7F2EC` e o texto atualizado dentro do próprio APK. O APK serve para
instalação manual; para publicar pelo Play Console, use o AAB. Como o APK do CI
usa a chave de upload, ele pode não instalar por cima de uma cópia distribuída
pelo Google Play caso a chave de assinatura do app seja diferente. Nesse caso,
teste pela faixa do Play ou baixe o APK assinado pelo Google no Explorador de
pacotes de apps, sem apagar os dados da instalação atual.

Em 28/09/2026, a [execução 36429348578](https://github.com/chrislucena-hash/reconexao-essencial-app/actions/runs/36429348578)
gerou o APK claro com `versionCode` 7 a partir do commit `672878c`. SHA-256 do
APK: `c4e1c4c4852c599d8823f340ca596594aecb49a45b62417a3b5bd68424df7fdd`.
O JavaScript do APK é idêntico ao do AAB de código 7 gerado anteriormente.

Antes do reenvio após uma rejeição, siga o [checklist do Play Console](docs/PLAY_CONSOLE_REVIEW.md), incluindo a declaração de recursos de saúde, a ficha da loja e o ícone da versão instalada.

## Assinatura

Para publicar no Google Play, crie `android/keystore.properties` a
partir do exemplo e coloque o arquivo de keystore no caminho indicado. Esses
arquivos são locais e não devem ser enviados ao GitHub.

A chave precisa ser a chave de upload da aplicação já cadastrada no Play
Console. Se o aplicativo ainda não tiver sido publicado, a chave pode ser
criada uma única vez antes do primeiro upload.

## API

O build de produção usa `https://api.reconexaoessencial.com.br/api/v1` por
definição. O workflow exige que o domínio público entregue `/health`, as rotas
de autenticação/Diário e o CORS do Capacitor sem redirecionamento. A VPS já
responde por HTTPS direto; para dispensar o proxy Cloudflare, o registro DNS
`api` precisa apontar para `187.127.12.195` em modo **DNS only**. Enquanto o
proxy produzir `301` para a própria URL, o app não acessará o backend e o
workflow de release falhará antes de gerar o AAB.
