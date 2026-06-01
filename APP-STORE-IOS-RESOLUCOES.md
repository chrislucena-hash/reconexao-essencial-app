# Layout iOS e Capturas da App Store

O app usa layout responsivo e safe areas nativas; nao existem telas duplicadas
por aparelho. O mesmo codigo atende os tamanhos oficiais abaixo.

## iPhone

| Grupo App Store | Vertical | Horizontal | Cobertura no layout |
| --- | --- | --- | --- |
| 6.9 pol. | 1320 x 2868, 1290 x 2796 ou 1260 x 2736 | inverso | Conteudo compacto, notch e home indicator |
| 6.7 pol. | 1290 x 2796 ou 1284 x 2778 | inverso | Conteudo compacto, notch e home indicator |
| 6.5 pol. | 1284 x 2778 ou 1242 x 2688 | inverso | Conteudo compacto, notch e home indicator |
| 6.3 pol. | 1206 x 2622 | inverso | Conteudo compacto, Dynamic Island e home indicator |
| 6.1 pol. | 1179 x 2556, 1170 x 2532 ou 1125 x 2436 | inverso | Conteudo compacto e safe areas |
| 5.5 pol. | 1242 x 2208 | inverso | Modo compacto sem notch |
| 4.7 pol. | 750 x 1334 | inverso | Reducao de espacamento para altura menor |

## iPad

| Grupo App Store | Vertical | Horizontal | Cobertura no layout |
| --- | --- | --- | --- |
| 13 pol. | 2064 x 2752 ou 2048 x 2732 | inverso | Conteudo centralizado ate 52rem |
| 12.9 pol. | 2048 x 2732 | inverso | Conteudo centralizado ate 52rem |
| 11 pol. | 1668 x 2420, 1668 x 2388 ou 1640 x 2360 | inverso | Conteudo centralizado ate 52rem |

## Implementacao

- `viewport-fit=cover` permite que o app ocupe a tela completa dos iPhones.
- `env(safe-area-inset-*)` protege conteudo, modais, botoes fixos e navegacao.
- A barra inferior sobe acima do home indicator.
- Telas de tablet utilizam largura maior sem esticar formulários alem do legivel.
- O projeto Capacitor iOS usa `contentInset: 'never'` porque o espacamento ja e
  aplicado no layout React, evitando margem dupla.

## Preparar Build iOS

Em um Mac com Xcode:

```bash
npm install
npm run ios:sync
npm run ios:open
```

O Bundle ID gerado e `com.reconexaoessencial`. Antes de testar em aparelho, a API
deve aceitar a origem nativa iOS:

```text
capacitor://app.reconexaoessencial.com.br
```

Capturas para submissao devem ser feitas no Simulator nos tamanhos da tabela,
principalmente iPhone 6.9 pol. e iPad 13 pol. se o app suportar iPad.
