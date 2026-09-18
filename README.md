# MCF Mission Control Live

Painel público do MCF com atualização automática orientada a eventos.

## Fluxo
1. O repositório `leon337/multiagent-collaboration-framework` emite eventos GitHub.
2. O webhook GitHub ativo reage a `pull_request`, `issues` e `release`.
3. O webhook chama um Vercel Deploy Hook privado.
4. A Vercel executa `npm run build`.
5. `scripts/build-snapshot.mjs` consulta o estado público atual do MCF.
6. O build gera `dist/snapshot.json`.
7. O alias público recebe a nova versão.
8. A página consulta `/snapshot.json` a cada 30 segundos sem consumir a API GitHub no navegador.

## Garantias
- o Deploy Hook não fica no código público;
- o painel é read-only sobre o MCF;
- release, merge e deploy de produção do runtime MCF continuam boundaries separados;
- o snapshot é evidência de leitura, não autorização operacional.

Produção: https://mcf-long-mission-public.vercel.app
