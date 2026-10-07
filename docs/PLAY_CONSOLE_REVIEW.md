# Reenvio ao Google Play: Reconexão Essencial

## Nova rejeição comunicada em 07/10/2026

O Google apontou incompatibilidade entre **Experiência no app** e **ícone de alta resolução pt-BR**, citando `IN_APP_EXPERIENCE-6304.png` e `HI_RES_ICON-5504.png`. Esses arquivos não vieram com a mensagem disponível neste repositório, e o e-mail não informa o `versionCode` analisado. Portanto, não é possível atribuir a rejeição ao AAB v12.

No AAB v12, os 15 ícones do launcher e `/icon-512.png` contêm a arte cósmica com o nome completo, mas a capa e o cabeçalho exibiam outro desenho (`/icon.svg`). A próxima revisão troca essas duas referências para `/icon-512.png` e unifica o título do atalho web; o teste de release verifica a imagem exibida na capa. Gere um novo AAB com `versionCode` superior ao último usado no Play Console após essa alteração.

Antes de reenviar, compare as duas capturas da rejeição com a **ficha realmente publicada**, incluindo páginas padrão, personalizadas e traduzidas. Confira o `versionCode` rejeitado e os pacotes ativos em produção e em todas as faixas de teste; substitua ou desative versões antigas com o X do Capacitor. Instale o novo pacote **pela faixa de teste** e confira ícone normal, redondo/adaptativo, capa e nome. A comparação automatizada só valida os arquivos locais e do AAB; ela não lê a ficha atual do Play Console.

## Pacote atual em 06/10/2026

O [workflow Android v12](https://github.com/chrislucena-hash/reconexao-essencial-app/actions/runs/37495303769)
gerou AAB e APK assinados a partir do commit `437d89a`. O manifesto dentro do
AAB contém `versionCode` **12**, `versionName` 1.0.0 e `minSdkVersion` 24. A
identidade instalada e os 15 ícones empacotados passaram na comparação com a
ficha pt-BR; o frontend claro e a auditoria de dependências de execução também
passaram. O [Release Readiness](https://github.com/chrislucena-hash/reconexao-essencial-app/actions/runs/37495285751)
ficou verde com a API pública respondendo `200`.

Baixe o artefato `reconexao-essencial-v12-aab` desse workflow, extraia
`app-release.aab` e envie-o **a uma faixa de testes fechados** no Play Console.
O pacote v12 ainda não foi enviado ao Play Console por este workflow. Confirme
que o Console mostra **12 (1.0.0)** nos novos pacotes, instale pela faixa e
verifique ícone, nome, login, navegação e persistência no aparelho antes de
solicitar análise para produção. Os pacotes v10/v11 não têm a atualização do
Capacitor 7.6.9 e não devem ser usados para esta submissão.

## Verificação do ícone em 05/10/2026

A nova captura do Play Console continua mostrando a **arte cósmica com texto**
na ficha pt-BR e o **X padrão do Capacitor** no launcher analisado. A imagem
não informa qual `versionCode` foi instalado na análise; portanto, não prova
que o pacote mais recente tenha o X.

O AAB assinado `versionCode` **11**, produzido pela [execução Android
37307080225](https://github.com/chrislucena-hash/reconexao-essencial-app/actions/runs/37307080225),
foi aberto e verificado: nome instalado **Reconexão Essencial**, pacote
`com.reconexaoessencial`, `minSdkVersion` 24 e todos os 15 PNGs de launcher
normal, redondo e adaptativo contêm a identidade da ficha, sem o X. O script
`scripts/verify_android_identity.py` compara os pixels desses recursos com os
do AAB e bloqueia alterações da arte aprovada no workflow de release.

**Não use o checkout `agent/ios-testflight-release` para uma nova release sem
alinhar sua identidade:** nele há mudanças locais de ícone para um coração sem
texto, diferente da ficha mostrada nesta captura. O candidato v11 foi gerado
do ramo `release/mobile-20261001` com a arte cósmica e o texto.

No Play Console, identifique o `versionCode` da submissão rejeitada e confira
produção, teste aberto, fechado e interno. Substitua ou desative os pacotes
antigos que ainda exibem o X; o [procedimento oficial de reenvio](https://support.google.com/googleplay/android-developer/answer/2477981?hl=pt-BR)
exige tratar as faixas afetadas. Instale o **novo pacote enviado pela própria
faixa de teste** e compare o launcher com a ficha pt-BR antes de solicitar nova
revisão. O AAB v11 foi gerado antes da atualização de segurança do Capacitor
de 6 de outubro; gere e instale um novo pacote a partir da revisão corrigida.

## Domínio e contrato móvel (01/10/2026)

O backend FastAPI na VPS `187.127.12.195` respondeu `200` por HTTPS direto.
O CORS em produção foi atualizado para `http://localhost` (Android),
`capacitor://localhost` e `https://localhost` (iOS), preservando as origens
anteriores. Preflights de autenticação e Diário agora retornam `200` com a
origem correta. O código também inclui essas origens por padrão e os dois
workflows executam `scripts/verify_mobile_backend.py` para checar `/health`,
CORS, rotas e envelope de erro antes de compilar. O envio do Diário ao backend
agora cria/sincroniza o usuário antes da entrada e não envia notas padrão 3/5
como avaliações reais.

**Acesso público corrigido em 06/10/2026:** o registro DNS `api` foi alterado
para **DNS only** com o IP da VPS. A URL pública de `/health` respondeu `200`
com `{"status":"ok"}` sem redirecionamento. Os workflows verificam agora o
domínio público diretamente, sem `MOBILE_BACKEND_ORIGIN_IP`. Confira novamente
com `VITE_API_BASE_URL=https://api.reconexaoessencial.com.br/api/v1 python3 scripts/verify_mobile_backend.py`
antes de enviar às lojas.

## Candidato sem IA (01/10/2026)

Para a próxima compilação Android e iOS, `features.ts` fixa `AI_ENABLED = false`.
O app não solicita análises pessoais, receitas, dicas nem áudio ao serviço de IA.
O Início oferece uma reflexão e um desafio incluídos no app; o Guia mostra
sugestões fixas identificadas como tal. Os botões para gerar outras receitas
ficam ocultos. As práticas com voz usam a síntese do dispositivo quando
disponível; a disponibilidade e a voz variam conforme o aparelho. A Comunidade
e seus links de navegação ficam ocultos nesta versão, pois publicar depende
de moderação por IA. Os dados já publicados não são apagados.

Os workflows de Android e iOS usam `npm run build:mobile` e não exigem mais
`VITE_CONTENT_API_BASE_URL` nem o servidor Node de conteúdo. Ambos **ainda
verificam o `/health` do backend FastAPI**, necessário para login e dados. Se
`api.reconexaoessencial.com.br`
continuar em redirecionamento para si mesmo, a compilação de release falhará
antes de empacotar; resolva o acesso HTTPS do domínio. O ajuste de DNS/SSL
pendente é independente de usar IA.

Antes de enviar para produção: gere novos pacotes a partir desta revisão,
instale Android via faixa de teste e iOS via TestFlight, confirme conteúdo
fixo, síntese de voz ou leitura visual, ausência da Comunidade, persistência
dos dados e correspondência do ícone instalado com a ficha. Revise a ficha da
loja para que ela não prometa geração por IA ou recursos ocultos nesta versão.
Os números de versão devem superar os últimos já enviados em cada loja.

As seções datadas abaixo registram diagnósticos e requisitos de versões
anteriores; as instruções sobre publicar a API Node não se aplicam a este
candidato sem IA.

## Nova rejeição de 29/09/2026: identidade e interface

O Play Console apontou **ícone instalado diferente da ficha pt-BR** e
**controles sem resposta ou conteúdo provisório**. Nas capturas recebidas em
29/09, a ficha pt-BR usa um coração azul/roxo com a inscrição
“RECONEXÃO ESSENCIAL” sobre fundo cósmico; o launcher do app analisado exibe o
**X azul padrão do Capacitor** em fundo branco. O nome instalado aparece
truncado como “Reconexão Esse...” e a evidência visual não prova que o nome
esteja errado. A captura também não mostra o `versionCode` do pacote analisado.

O X corresponde ao ícone nativo preservado no código de `d5362a9` (15/09),
anterior à troca de identidade de `c0ac668` (24/09). AABs v7 e v8 foram
inspecionados: os ícones normal, redondo e adaptativo contêm o coração, não o X.
É provável que a análise tenha instalado um pacote antigo ainda ativo, mas só
o Play Console pode confirmar qual versão foi examinada. Verifique os bundles
ativos em **produção, teste aberto, teste fechado e teste interno**; substitua
ou desative os que ainda trazem o X. A [orientação do Google para reenviar um
app rejeitado](https://support.google.com/googleplay/android-developer/answer/2477981?hl=pt-BR)
também pede a correção em todas as faixas pertinentes, não apenas na nova
versão de teste.

Os AABs v7/v8 mostram um coração em fundo azul escuro **sem texto nem textura
cósmica**, diferente da ficha apresentada. Para a próxima compilação, a arte
cósmica da ficha foi mantida como identidade: o PNG local da Play e os ícones
Android normal, redondo e adaptativo foram gerados a partir da arte já usada no
iPhone. Essa correção está no código, mas ainda não em um pacote instalado pela
Play. Confira todas as fichas (padrão, personalizadas e traduzidas), instale o
novo AAB por uma faixa de teste e compare o launcher normal, redondo e
adaptativo com a ficha visível ao mesmo testador.

O código desta revisão remove os vídeos/fotos de demonstração da comunidade,
liga o compartilhamento, abre os detalhes do diário, mostra estados de
carregamento/erro/vazio e inclui a foto da capa no pacote em vez de depender
de uma URL externa. A câmera de vídeos de demonstração, sem upload real, foi
retirada. Teste no dispositivo todos os botões visíveis, inclusive publicação,
comentários, receita, áudio, diário e configurações; a compilação sozinha não
comprova esses fluxos.

Outra falha confirmada no teste visual era o contraste: títulos brancos na
comunidade, jornada e configurações ficavam sobre o fundo claro, a aba selecionada
do Guia tinha texto escuro sobre botão escuro, e a entrada de comentários tinha
fundo escuro com texto escuro. Esses elementos foram corrigidos preservando a
paleta. O botão de imagem junto ao texto da publicação alterava a foto de perfil;
foi retirado dali, mantendo a alteração na própria foto com identificação clara.
Os estilos Tailwind são agora compilados e incluídos no pacote; o app não depende
de `cdn.tailwindcss.com` para montar a interface. O fundo da WebView e o manifesto
web também usam `#F7F2EC`. A marca do ícone permanece a mesma.

Validação local: TypeScript e build passaram. Um navegador em largura de celular,
com serviços externos bloqueados e dados de teste locais, exibiu 11 telas com
fundo claro e sem exceções; abertura/fechamento dos detalhes do diário,
compartilhamento de publicação, legibilidade da entrada de comentários e erro
de carregamento da comunidade foram verificados. Esse teste não verifica login
real, publicação no Firestore, geração de áudio ou instalação Android; repita
esses fluxos com a conta de revisão e o pacote final no dispositivo.

### Auditoria de funções simuladas e confirmações prematuras (29/09/2026)

Esta revisão distingue o **candidato v8** (`codex/play-rejection-fixes-20260929`)
do checkout local `agent/ios-testflight-release`; eles não têm o mesmo código.

- No checkout local, `components/Community.tsx` ainda apresenta quatro vídeos
  de demonstração externos como momentos de usuários, um botão de vídeo sem
  fluxo de upload, “Conectar” apenas em estado local, “Reportar” apenas em
  estado local e um botão de compartilhar sem ação. **Não gere uma nova release
  Android desse checkout.** O candidato v8 retirou os momentos demonstrativos,
  o upload de vídeo e o botão falso; o antigo “Reportar” passou a indicar
  claramente “Ocultar nesta sessão”, mas denúncia e moderação reais continuam
  pendentes.
- No v8, `services/geminiService.ts` devolve mensagens, desafios e receitas
  fixas quando a API de conteúdo falha. O “Alquimista” monta uma receita
  genérica a partir do texto digitado, sem garantir um preparo culinário válido.
  `components/Guidance.tsx` mostra essas sugestões sem distinguir sua origem;
  o modal promete “5 Alquimias Diferentes”, embora o fallback local contenha
  duas opções de desjejum, duas de almoço e uma de jantar. O botão de atualizar
  a receita fermentada pode reapresentar a mesma receita fixa como se fosse
  nova. Rotule o conteúdo local como sugestão fixa ou mostre indisponibilidade
  explícita; não prometa geração ou atualização quando a API estiver fora.
- No v8, `components/Tracker.tsx` exibe sucesso assim que chama `onSaveLog`,
  enquanto `App.tsx` captura e apenas registra uma falha de gravação no
  Firestore. `NextStepGuide` também afirma “Diário atualizado com sucesso!”
  antes de qualquer gravação; o questionário mostra “registro concluído” antes
  de confirmar o envio. Perfil, progresso da jornada e reinício do ciclo
  são atualizados localmente mesmo quando a sincronização remota falha; no
  reinício, os erros são ignorados e ainda pode aparecer mensagem de exclusão
  completa. Trate a confirmação como resultado de uma operação verificada e
  mostre erro quando houver falha.
- Postagens e comentários do v8 usam Firestore de verdade, mas dependem de
  `/api/moderate-content`; sem `VITE_CONTENT_API_BASE_URL` funcional, a
  moderação bloqueia o envio. Respiração e meditação executam um cronômetro
  real; áudio gerado depende do mesmo servidor e pode recorrer à voz do
  dispositivo. `services/notificationService.ts` contém um agendador que só
  registra uma mensagem no console, mas nenhuma tela importa essa função.

**Resultado:** a ausência de vídeos demonstrativos no v8 não encerra a
violação de recursos corrompidos. Corrija as confirmações prematuras, os
fallbacks apresentados como geração e a infraestrutura antes de publicar.
Uma inspeção estática não substitui testar o AAB instalado pela Play com
uma conta de revisão e observar cada ação e seu estado após reiniciar o app.

### Correções no código para a próxima compilação (30/09/2026)

Na branch `codex/mobile-quality-fixes-20260930`, Diário, questionário, perfil,
metas e jornada só confirmam salvamento depois da resposta do Firestore. O
reinício usa um único lote para perfil, progresso e registros do diário; se o
lote falhar, o app mostra erro sem informar que os dados foram apagados. A
confirmação esclarece que conta, publicações e possíveis cópias no backend
permanecem. A sincronização adicional com o backend ainda é independente.

Falhas da API de conteúdo deixam de retornar mensagens ou receitas fixas como
se fossem geradas. Quando o Guia usa sugestões incluídas no app, elas são
identificadas como fixas; outras opções de receita mostram indisponibilidade.
Marcar uma meta sem preencher o Diário deixa de contar notas automáticas 3/5
de energia e presença como avaliações da pessoa. A troca de conta deixa de
reaproveitar temporariamente o diário e o progresso salvos localmente por
outra conta; falhas de leitura do Firestore mostram um aviso. O fluxo iOS passa a receber
`VITE_CONTENT_API_BASE_URL` e o padrão de disparo manual aponta para
`1.0.7 (8)`; o padrão Android passa a `versionCode 9`, porque o pacote 8 já
foi gerado. O servidor de conteúdo agora responde a `/api/health` e autoriza
as origens locais do Capacitor; ambos os workflows exigem que o servidor HTTPS
esteja publicado e aceite essas origens antes de empacotar.

Estas alterações **ainda exigem** teste instalado antes de publicação: salvar
e reabrir Diário, questionário, metas, perfil e jornada; testar falha de rede;
usar o Guia com API disponível e indisponível; conferir os botões da
Comunidade; comparar ícone da ficha pt-BR com o launcher normal, redondo e
adaptativo. A URL de conteúdo nativo precisa estar configurada e acessível.
O loop de redirecionamento do backend descrito abaixo também precisa ser
corrigido na infraestrutura. Em 30/09, a variável de repositório
`VITE_CONTENT_API_BASE_URL` não estava cadastrada no GitHub, e o endpoint
`/health` do backend ainda devolvia `301` para si mesmo. Nenhum novo
APK, AAB ou IPA foi criado por estas alterações até esse teste.

Após a escolha de manter a identidade visual já usada na ficha e no iPhone,
os ícones Android normal, redondo e adaptativo foram reconstruídos a partir de
`ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png`, que mostra
o coração luminoso, fundo cósmico e o nome. O PNG local
`assets/play-store/icon-512.png` e os ícones web também usam essa arte. A ficha
pt-BR vista na rejeição parece usar a mesma identidade; confirme o arquivo
efetivamente publicado, as fichas traduzidas e o ícone instalado de **cada
faixa ativa**. Se alguma faixa ainda instalar o X do Capacitor, substitua o
bundle antigo pela nova versão antes de pedir análise.

O servidor Node agora pode ser empacotado pelo `Dockerfile` e foi testado
localmente. As rotas de conteúdo já exigem token Firebase; CORS não substitui
essa autenticação. Depois, publique-o em um serviço HTTPS, configure
`GEMINI_API_KEY` e `FIREBASE_PROJECT_ID` no servidor e
`VITE_CONTENT_API_BASE_URL` nas Variables do GitHub com a URL base HTTPS,
sem `/api` no final. Verifique `GET /api/health` (incluindo
`dynamicContentConfigured: true`) e o preflight `OPTIONS /api/moderate-content`
com `Origin: capacitor://localhost` e `Origin: http://localhost`. A nova
verificação dos workflows impede criar um pacote nativo com essa API ausente.
O servidor FastAPI usado por `VITE_API_BASE_URL` é separado e ainda precisa
ter o loop 301 resolvido. Depois do deploy, faça o teste instalado com conta
de revisão antes de gerar/enviar iOS build 8 ou novo Android versionCode.

### Pacote v8 preparado em 29/09/2026

A [execução 36601017680 do GitHub Actions](https://github.com/chrislucena-hash/reconexao-essencial-app/actions/runs/36601017680)
concluiu com sucesso o build e a validação de assinatura do commit
`d7da53937508777965121c779b81030c6a119e66` na branch
`codex/play-rejection-fixes-20260929`, com `versionCode` **8**. O certificado
do AAB corresponde ao do AAB v7. Os arquivos copiados para este workspace são:

- APK assinado para teste: `android/app/build/outputs/apk/release/reconexao-essencial-v8-claro.apk` — SHA-256 `6d7cb45b252298f65ab83b3d025d1c6047f70cc9008aceb07b2ffde8fc8fe2e0`.
- AAB assinado para Play Console: `android/app/build/outputs/bundle/release/reconexao-essencial-v8.aab` — SHA-256 `17838a7131a397a964c1431a8b3f8c2aa887cb4f27d07c8ca6990f05e5174287`.

Os dois arquivos contêm CSS local com `#F7F2EC`, a imagem da capa e o texto atual
do questionário; os vídeos de demonstração removidos não estão no pacote. Não
foi possível instalar ou testar o AAB em um Android físico conectado aqui. O
APK usa a chave de upload e pode não instalar como atualização sobre uma cópia
da Play Store assinada pelo Google; verifique o AAB na faixa de testes. O v8
**não foi enviado ao Play Console**. Compare o código 8 com o maior código já
carregado no Console antes de qualquer envio.

**Bloqueio atual (confirmado em 01/10/2026):** o FastAPI na VPS responde
`200` em `127.0.0.1:8000/health`, e o Nginx da origem responde `200` em HTTPS
direto com certificado válido. Pela URL pública do Cloudflare, a mesma rota
responde `301` para si mesma. Um pedido público de verificação apareceu no log
do Nginx como `301`; a configuração do Nginx redireciona HTTP para HTTPS.
Isso indica que o Cloudflare está chegando à origem por HTTP, possivelmente
por modo **Flexible** ou regra de origem. Confira o modo efetivo para o
subdomínio `api` e use **Full (strict)**, já que a origem aceita HTTPS válido.
Não remova o redirecionamento da origem apenas para contornar o loop, pois isso
manteria o trecho Cloudflare→VPS sem HTTPS. [Diagnóstico oficial de loops](https://developers.cloudflare.com/ssl/troubleshooting/too-many-redirects/).
Além disso, as funções de conteúdo dinâmico em `services/geminiService.ts`
chamam `/api/...` do servidor Node usado na web. Esse servidor **não** é
empacotado no Android, e o FastAPI em `VITE_API_BASE_URL` não oferece essas
rotas. Quando esse servidor existir publicamente, defina
`VITE_CONTENT_API_BASE_URL` no build com a URL base HTTPS que oferece as rotas
`/api/...`; não use `VITE_API_BASE_URL` do FastAPI para isso sem implementar
as mesmas rotas. A revisão agora apresenta conteúdo local curado ou mensagem explícita
quando a chamada falha, mas geração dinâmica, áudio remoto e moderação precisam
de um endpoint implantado e testado para funcionar. **Não envie o novo pacote
para revisão até verificar essa infraestrutura e repetir os fluxos no Android.**
O antigo botão **Reportar** da comunidade só ocultava uma postagem localmente;
agora ele informa **Ocultar nesta sessão**. Implemente um fluxo real de denúncia
e moderação antes de lançar a comunidade como recurso público.

O workflow Android lê `VITE_CONTENT_API_BASE_URL` das **Variables** do repositório
GitHub. Configure essa variável somente depois de verificar as rotas `/api/...`
e permitir a origem da WebView no CORS do servidor. Não coloque a chave Gemini
em variável `VITE_*`: ela deve existir somente no servidor. O build web deixou
de substituir chaves Gemini dentro do JavaScript distribuído.

### Publicação segura da API de conteúdo (01/10/2026)

O servidor Node precisa de `GEMINI_API_KEY` e `FIREBASE_PROJECT_ID` no ambiente
de hospedagem. O segundo valor deve ser o projeto Firebase usado pelo app.
A chave Gemini fica apenas no servidor; o app envia o ID token da conta logada
em `Authorization: Bearer ...`, e o servidor o verifica com Firebase Admin.
`/api/health` é público, mas as demais rotas `/api/...` exigem token válido.
Não configure `FIREBASE_AUTH_EMULATOR_HOST` na produção.

Na VPS atual, o FastAPI usa `reconexao-api.service` na porta 8000; o
`reconexao-frontend.service` usa Node na porta 3000 e ainda serve uma versão
web antiga. `GET /api/health` nessa porta devolve HTML, não o novo health check.
Docker não está instalado na VPS. É possível implantar a API de conteúdo na
**mesma VPS em serviço systemd separado**, por exemplo na porta local 3001,
e expor somente o prefixo `/content/` no Nginx, preservando `/api/v1/` do
FastAPI e o serviço web existente. Nesse desenho, a variável GitHub seria
`VITE_CONTENT_API_BASE_URL=https://api.reconexaoessencial.com.br/content`;
o proxy deve encaminhar `/content/api/...` para `/api/...` no Node. A implantação
e essa configuração Nginx ainda **não foram feitas**.

Depois de implantar em HTTPS, verifique que
`<URL base>/api/health` retorna `dynamicContentConfigured: true` e
`authenticationConfigured: true`, que uma requisição anônima a
`/api/daily-content` retorna 401 e que um usuário real consegue carregar
conteúdo e publicar na comunidade. Os workflows Android e iOS verificam o
backend FastAPI sem redirecionamento, o health check da API de conteúdo, o
CORS com `Authorization` e a rejeição de anônimos antes de compilar. Defina
a variável GitHub `VITE_CONTENT_API_BASE_URL` com essa URL base HTTPS, sem
`/api` no final. Configure também limites de uso no provedor para
evitar consumo excessivo da API Gemini por contas autenticadas.

## Declaração de apps de saúde

Em **Política → Conteúdo do app → Apps de saúde**, declare as funções da versão enviada:

- **Controle de estresse, relaxamento e acuidade mental**: meditação, respiração e relaxamento guiados. Esta é a categoria explicitamente solicitada na rejeição.
- **Controle do sono**: há uma prática de relaxamento antes de dormir.
- **Controle de nutrição e peso**: o diário registra refeições e o Guia oferece receitas e informações gerais de alimentação; a categoria também abrange registro de consumo alimentar, mesmo sem metas de peso.
- **Educação e referências médicas**: o Guia contém informações sobre doença celíaca e exames para conversar com profissionais.

Confira todas as outras opções disponíveis antes de salvar. Não marque "Meu app não tem recursos de saúde". A declaração deve refletir a versão distribuída e todas as fichas de loja. Referência: [Ajuda do Play Console](https://support.google.com/googleplay/android-developer/answer/14738291?hl=pt-BR).

## Identidade do app

O nome instalado em Android é **Reconexão Essencial**, com pacote `com.reconexaoessencial`. Use esse mesmo nome em todas as fichas e traduções. A evidência de 29/09 confirma que o ícone da ficha pt-BR é a arte cósmica com texto, enquanto o pacote analisado mostrou o X padrão. Os AABs v7/v8 substituíram o X por um coração sem texto; a próxima compilação usará a arte cósmica já versionada neste branch. Confira as fichas personalizadas, capturas e **cada pacote ativo**; a captura do launcher não identifica o código de versão analisado.

## Descrição sugerida para a ficha principal

**Título:** Reconexão Essencial

**Descrição curta:** Diário, meditação e práticas de autoconhecimento no seu ritmo.

**Descrição completa:**

> Reconexão Essencial é um espaço de autoconhecimento e reflexão. Registre suas percepções no diário, acompanhe sua jornada pessoal e explore práticas guiadas de meditação, respiração e relaxamento, inclusive uma opção para o momento de dormir.
>
> O app também reúne receitas e informações gerais sobre alimentação. O questionário permite registrar sinais percebidos, sem identificar suas causas ou diagnosticar sensibilidades alimentares.
>
> O app não é um dispositivo médico e não diagnostica, trata, cura ou previne nenhuma condição médica. Consulte um profissional de saúde para orientações médicas, diagnóstico ou tratamento. Não altere sua dieta com base nos registros do app.

Se houver ficha em inglês, mantenha o título **Reconexão Essencial** e traduza as descrições preservando os mesmos limites e recursos reais. Revise capturas de tela e textos de todas as fichas após atualizar o app.

**A rejeição cita especificamente uma descrição completa em inglês ainda publicada no Play Console**, com “Essential Reconnection”, “healing”, “Temple Reading” e “Self-Healing”. A descrição em português acima não substitui essa ficha. Atualize a ficha em inglês e todas as fichas personalizadas ou traduções que ainda repitam esses termos.

**Descrição curta sugerida em inglês:** Journaling, meditation and self-reflection at your own pace.

**Descrição completa sugerida em inglês:**

> Reconexão Essencial is a space for self-reflection. Write in a personal journal, follow your journey, and explore guided meditation, breathing and relaxation practices, including an exercise for bedtime.
>
> The app also offers recipes and general information about food. A questionnaire lets you record sensations and symptoms you notice. It does not identify their causes, diagnose food sensitivities or measure health.
>
> This app is not a medical device and does not diagnose, treat, cure or prevent medical conditions. Seek qualified professional advice for health concerns, diagnosis or treatment. Do not change your diet based on records in the app.

## Antes de enviar à revisão

1. Use `android/` da raiz para gerar a release; `frontend/android/` contém artefatos locais e não é a fonte do CI.
2. Gere um AAB assinado com a chave de upload cadastrada e `versionCode` maior que o último enviado. O workflow recebe esse número em `version_code`.
3. Instale a nova versão em uma faixa de testes e confira nome e ícone no launcher, inclusive o ícone redondo/adaptativo. Confira também o link de solicitação de exclusão de conta em **Configurações**.
4. Atualize declaração, título, ícone e descrições no Play Console. Confirme a política de privacidade pública e no app, conforme [política de saúde](https://support.google.com/googleplay/android-developer/answer/16679511?hl=pt-BR). A página pública atualmente vinculada no app é a [política no Notion](https://www.notion.so/POL-TICA-DE-PRIVACIDADE-APP-RECONEX-O-ESSENCIAL-31eb9d89692a801e947efdd664aaa46d). Revise nela a descrição de dados coletados, uso, compartilhamento, retenção e exclusão, e informe no formulário de segurança dos dados um [recurso web para solicitar exclusão da conta](https://support.google.com/googleplay/android-developer/answer/13327111?hl=pt-BR). A solicitação por e-mail precisa ser atendida pela equipe, inclusive quanto aos dados associados à conta.
5. Envie as mudanças para revisão em **Visão geral da publicação**.

Antes do passo 5, valide a política e **Segurança dos dados** contra o funcionamento real: o app usa Firebase Authentication/Firestore, sincroniza perfil e diário com o backend e permite publicações, comentários e foto de perfil na comunidade. A política pública atual é breve e não explica claramente provedores, retenção e o procedimento de exclusão desses registros. A opção de Configurações apenas abre um pedido por e-mail; a equipe ainda precisa executar e confirmar a exclusão dos dados em todos os serviços aplicáveis. Uma URL pública que abre normalmente não basta para confirmar essas declarações.

Em 25/09/2026, a página pública ainda chamava o questionário de **“testes de sensibilidade”**. O app revisado o apresenta como registro de percepções e não identifica sensibilidades. Atualize essa expressão na política publicada e confira que o texto sobre exclusão descreva com precisão o pedido por e-mail e o procedimento efetivamente executado pela equipe.

### Artefato anterior preparado em 24/09/2026

- Branch: `codex/android-play-policy-20260924`.
- Workflow `android-release.yml`: AAB assinado com `versionCode` 6 e pacote `com.reconexaoessencial`. O certificado de assinatura coincide com o do AAB anterior gerado pelo CI, de `versionCode` 5.
- Antes de carregar o AAB, compare o número 6 com o maior `versionCode` já enviado ao Play Console. O histórico de uploads no Play Console não pôde ser verificado pelo repositório.
- O manifesto e os recursos do AAB registram **Reconexão Essencial**; os ícones nativos foram comparados com os arquivos fonte. A instalação e inspeção visual no launcher ainda exigem uma faixa de testes e um dispositivo Android.
- Em 29/09, capturas do Play Console mostraram o X padrão do Capacitor no launcher e a arte cósmica com coração na ficha pt-BR; o código de versão instalado na análise não aparece nelas.
- O AAB de `versionCode` 6 não contém os ajustes de texto de 25/09/2026. Use um novo AAB gerado a partir da revisão mais recente, com código superior ao maior já enviado ao Play Console.

### Novo candidato em 25/09/2026

- A [execução 36137312685 do CI](https://github.com/chrislucena-hash/reconexao-essencial-app/actions/runs/36137312685) gerou um AAB assinado com `versionCode` 7 a partir do commit `754cdac`.
- O AAB está em `android/app/build/outputs/bundle/release/reconexao-essencial-v7.aab` neste workspace; SHA-256: `09047ce877a93cbe04aa5687c68cf601c0f9de7a6a34a2f627c2769409ccf98b`.
- O código 7 também é provisório até ser comparado ao maior `versionCode` já enviado ao Play Console. O pacote e o nome estão corretos, a assinatura é a mesma do AAB anterior e os 15 ícones do pacote coincidem com os arquivos fonte.
