# Manual de Atualização Segura - Fale Comigo (CAA)

Este guia foi criado para garantir que você possa fazer **qualquer alteração ou atualização no site** sem o risco de quebrar a versão oficial que seus usuários utilizam no GitHub Pages.

---

## 🛡️ O Segredo: As Duas Branches (Ramificações)

No GitHub, seu projeto agora trabalha com **dois caminhos separados**:

1. **`main` (Produção / Site no Ar):**
   - É o código que o GitHub Pages lê para exibir seu site ao público.
   - **Regra de ouro:** NUNCA edite diretamente na branch `main`.

2. **`dev` (Desenvolvimento / Testes):**
   - É o seu "laboratório". Aqui você pode mudar textos, trocar imagens, mexer no código ou testar novas ideias.
   - Mesmo que você cometa algum erro aqui, o site oficial continuará funcionando perfeitamente!

---

## 📋 Passo a Passo para Atualizar o Site

### Passo 1: Mudar para a branch de testes (`dev`)
- No **GitHub (pelo navegador)** ou no seu programa (VS Code / GitHub Desktop):
  1. Clique no seletor de ramificações (onde está escrito `main`).
  2. Digite `dev` e selecione/crie essa ramificação.

### Passo 2: Fazer suas alterações e testar
- Abra o arquivo que deseja editar (por exemplo, [index.html](file:///g:/Meu%20Drive/Fale%20Comigo/index.html) ou [styles.css](file:///g:/Meu%20Drive/Fale%20Comigo/styles.css)).
- Faça as mudanças desejadas na branch `dev`.
- Abra o `index.html` no seu navegador para testar se tudo funciona como esperado.

### Passo 3: Enviar as alterações para o GitHub
- Faça o **Commit** e o **Push** das suas alterações para a branch `dev`.

### Passo 4: Aprovar e publicar no site oficial (Pull Request)
Quando você tiver certeza absoluta de que tudo está perfeito na branch `dev`:
1. Acesse o seu repositório no **GitHub**.
2. O GitHub mostrará um botão amarelo chamado **"Compare & pull request"**. Clique nele.
3. Defina a base como `main` e a comparação como `dev`.
4. Clique em **"Create pull request"**.
5. Clique em **"Merge pull request"** e depois em **"Confirm merge"**.

🎉 **Pronto!** O GitHub Actions lerá a branch `main` e atualizará seu site oficial automaticamente em menos de 1 minuto, sem qualquer risco de ter enviado algo quebrado!

---

## 🛠️ Arquivos de Segurança Criados no Projeto

- [package.json](file:///g:/Meu%20Drive/Fale%20Comigo/package.json): Configuração de empacotamento e testes do projeto.
- [.gitignore](file:///g:/Meu%20Drive/Fale%20Comigo/.gitignore): Protege arquivos temporários e chaves privadas contra vazamentos no GitHub.
- [.github/workflows/deploy.yml](file:///g:/Meu%20Drive/Fale%20Comigo/.github/workflows/deploy.yml): Robô de automação que publica seu site no GitHub Pages com segurança.
