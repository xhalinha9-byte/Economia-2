# Economia App

App de controle financeiro pessoal (React + Vite + Tailwind + Recharts).

## Rodando localmente
npm install
npm run dev

## Build de produção
npm run build
# gera a pasta dist/

## Deploy no Netlify

### Opção A — Conectar repositório Git (recomendado)
1. Suba esta pasta para um repositório no GitHub/GitLab/Bitbucket.
2. No Netlify: "Add new site" > "Import an existing project".
3. Selecione o repositório.
4. Build command: npm run build
   Publish directory: dist
   (o arquivo netlify.toml já configura isso automaticamente)
5. Deploy.

### Opção B — Netlify CLI (sem Git)
1. npm install -g netlify-cli
2. npm install
3. npm run build
4. netlify deploy --prod --dir=dist

### Opção C — Drag and drop manual
1. npm install
2. npm run build
3. Acesse app.netlify.com/drop e arraste a pasta dist/ gerada.
