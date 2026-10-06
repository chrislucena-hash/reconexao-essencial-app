# Testes de pré-publicação

Execute na revisão exata usada para gerar o AAB e o IPA:

```bash
npm ci
npx playwright install chromium
npm run lint
python3 scripts/verify_android_identity.py
npm audit --omit=dev
npm run test:e2e
npm run test:release
```

`test:e2e` usa Firebase simulado apenas no servidor de testes. Verifica abertura sem sessão, recuperação de autenticação ou perfil sem resposta, abertura do painel e navegação básica em uma tela móvel. Esses testes não acessam contas reais.

`test:release` compila o frontend com a configuração de produção, abre a versão compilada com o SDK Firebase real e confere capa, logotipo, manifesto e tema claro. Também exige resposta `200` com `{"status":"ok"}` de `https://api.reconexaoessencial.com.br/health`, sem redirecionamento. A variável `RELEASE_API_HEALTH_URL` permite testar outro endereço de pré-produção, mas a checagem do domínio público deve passar antes do envio à produção.

O workflow **Release Readiness** executa os mesmos testes no GitHub Actions e conserva os rastros das falhas. Resultado verde é uma condição necessária, mas não substitui a instalação do AAB/APK e do IPA em aparelhos reais: confirme login com conta de teste, carregamento do perfil, salvamento de dados e nome/ícone instalados antes de solicitar revisão às lojas.

O workflow **Android Release** executa o mesmo verificador de identidade antes do build e o repete com `--aab` no pacote gerado, comparando todos os 15 ícones empacotados com os recursos aprovados. A arte da ficha atualmente usada como referência está em `public/icon-512.png` no ramo de release.

Em 5 de outubro de 2026, a checagem da API pública falhou porque `/health` devolveu `301` apontando para si mesmo. Em 6 de outubro, após mudar somente o DNS de `api` para acesso direto à VPS, a URL pública respondeu `200` com `{"status":"ok"}` e o teste da API passou localmente. A auditoria do workflow então identificou duas dependências críticas recém-divulgadas; o lockfile foi atualizado para Capacitor 7.6.9 e `proxy-addr` 2.0.8. Os pacotes anteriores a essa atualização não contêm as correções.

O [Release Readiness de 06/10/2026](https://github.com/chrislucena-hash/reconexao-essencial-app/actions/runs/37495285751) passou integralmente. O [Android Release v12](https://github.com/chrislucena-hash/reconexao-essencial-app/actions/runs/37495303769) também passou, incluindo assinatura, versão interna, ícones e frontend claro. O IPA iOS 1.0.7 (10) foi exportado e seu upload foi marcado como completo, mas o workflow recebeu `401` ao consultar o processamento; confirme o estado final em App Store Connect → TestFlight → iOS → Build Uploads antes de selecionar essa compilação.
