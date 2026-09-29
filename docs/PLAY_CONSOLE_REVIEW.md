# Reenvio ao Google Play: Reconexão Essencial

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

Há uma segunda diferença visual a resolver: o arquivo
[`assets/play-store/icon-512.png`](../assets/play-store/icon-512.png) e os
ícones nativos v7/v8 mostram o coração em fundo azul escuro **sem texto nem
textura cósmica**. Esse arquivo ainda não é o ícone da ficha mostrado na
captura. Escolha uma identidade final e aplique-a em todas as fichas
(padrão, personalizadas e traduzidas) e no pacote Android. Se a escolha for o
ícone nativo atual, envie o PNG deste repositório à ficha; se for manter a
arte cósmica da ficha, prepare os ícones nativos a partir da arte original e
gere um novo AAB. Instale esse AAB por uma faixa de teste e compare o launcher
normal, redondo e adaptativo com a ficha visível ao mesmo testador.

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

**Bloqueio atual:** em 29/09/2026, `https://api.reconexaoessencial.com.br/api/v1/health`
respondia `301` com `Location` igual à própria URL. O app não consegue usar o
backend enquanto houver esse loop. Verifique o modo SSL/TLS e os redirecionamentos
do subdomínio `api` no Cloudflare e no servidor de origem; com certificado válido
na origem, prefira **Full (strict)**. [Guia Cloudflare para loops](https://developers.cloudflare.com/ssl/troubleshooting/too-many-redirects/).
Além disso, as funções de conteúdo dinâmico em `services/geminiService.ts`
chamam `/api/...` do servidor Node usado na web. Esse servidor **não** é
empacotado no Android, e o FastAPI em `VITE_API_BASE_URL` não oferece essas
rotas. Quando esse servidor existir publicamente, defina
`VITE_CONTENT_API_BASE_URL` no build com a origem HTTPS que oferece as rotas
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

## Declaração de apps de saúde

Em **Política → Conteúdo do app → Apps de saúde**, declare as funções da versão enviada:

- **Controle de estresse, relaxamento e acuidade mental**: meditação, respiração e relaxamento guiados. Esta é a categoria explicitamente solicitada na rejeição.
- **Controle do sono**: há uma prática de relaxamento antes de dormir.
- **Controle de nutrição e peso**: o diário registra refeições e o Guia oferece receitas e informações gerais de alimentação; a categoria também abrange registro de consumo alimentar, mesmo sem metas de peso.
- **Educação e referências médicas**: o Guia contém informações sobre doença celíaca e exames para conversar com profissionais.

Confira todas as outras opções disponíveis antes de salvar. Não marque "Meu app não tem recursos de saúde". A declaração deve refletir a versão distribuída e todas as fichas de loja. Referência: [Ajuda do Play Console](https://support.google.com/googleplay/android-developer/answer/14738291?hl=pt-BR).

## Identidade do app

O nome instalado em Android é **Reconexão Essencial**, com pacote `com.reconexaoessencial`. Use esse mesmo nome em todas as fichas e traduções. A evidência de 29/09 confirma que o ícone da ficha pt-BR é a arte cósmica com texto, enquanto o pacote analisado mostrou o X padrão. Os AABs v7/v8 já substituíram o X por um coração sem texto, mas a arte da ficha ainda não corresponde à arte de 512 × 512 versionada neste repositório. Resolva essa diferença escolhendo a identidade final descrita acima. Confira também fichas personalizadas, capturas e **cada pacote ativo**; a captura do launcher não identifica o código de versão.

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
