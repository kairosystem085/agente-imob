# GitHub Publish Notes

This repository is now being used as the GitHub destination for the ImobIA scaffold.

Local git push was not available from the Codex Windows shell because Git authentication returned `SEC_E_NO_CREDENTIALS`. Files were therefore published through the GitHub connector.

Recommended local workflow after cloning:

```bash
npm install
npm run dev
```

For future direct pushes from a local machine:

```bash
git clone https://github.com/kairosystem085/agente-imob.git
cd agente-imob
npm install
npm run dev
```
