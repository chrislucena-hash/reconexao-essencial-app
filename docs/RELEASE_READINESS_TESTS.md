# Testes de pré-publicação

Execute na revisão exata usada para gerar o AAB e o IPA:

```bash
npm ci
npx playwright install chromium
npm run lint
npm run test:e2e
npm run test:release
```

`test:e2e` usa Firebase simulado apenas no servidor de testes. Verifica abertura sem sessão, recuperação de autenticação ou perfil sem resposta, abertura do painel e navegação básica em uma tela móvel. Esses testes não acessam contas reais.

`test:release` compila o frontend com a configuração de produção, abre a versão compilada com o SDK Firebase real e confere capa, logotipo, manifesto e tema claro. Também exige resposta `200` com `{"status":"ok"}` de `https://api.reconexaoessencial.com.br/health`, sem redirecionamento. A variável `RELEASE_API_HEALTH_URL` permite testar outro endereço de pré-produção, mas a checagem do domínio público deve passar antes do envio à produção.

O workflow **Release Readiness** executa os mesmos testes no GitHub Actions e conserva os rastros das falhas. Resultado verde é uma condição necessária, mas não substitui a instalação do AAB/APK e do IPA em aparelhos reais: confirme login com conta de teste, carregamento do perfil, salvamento de dados e nome/ícone instalados antes de solicitar revisão às lojas.

Em 5 de outubro de 2026, os testes controlados e a abertura do bundle passaram. A checagem da API pública falhou porque `/health` devolveu `301` apontando para si mesmo. O candidato ainda não está apto à produção.
