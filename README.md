# trvzera. — Site pessoal

Site pessoal em produção em **[trvzera.com.br](https://trvzera.com.br)**. Foi pensado e desenvolvido por mim como um hub central: no estilo de um Linktree, reúne minhas redes sociais em um só lugar; além disso, apresenta quem sou, o que gosto e uma vitrine de produtos com links de afiliado para compra.

Na **página inicial** há um perfil com banner, avatar e atalhos para Instagram, Steam, Discord, TikTok, YouTube e para o meu portfólio profissional. Na seção **Sobre**, compartilho mais da minha identidade como Web Designer e editor — tier list de jogos favoritos, detalhes do setup e playlist. Em **Produtos**, organizo recomendações por categoria (hardware, periféricos, acessórios de setup, dados de RPG etc.) com links diretos para lojas parceiras.

## Estrutura do projeto

| Página | Arquivo | Função |
|--------|---------|--------|
| Início | `index.html` | Apresentação, card de perfil e redes sociais |
| Sobre | `about.html` | Bio, jogos, setup e gostos pessoais |
| Produtos | `produtos/index.html` | Catálogo de afiliados por categoria |

O site é estático (HTML, CSS e JavaScript), com tema claro/escuro, transições entre páginas e layout responsivo. Os links de afiliado usados na loja ficam referenciados em `produtos/links.txt` para facilitar manutenção.

