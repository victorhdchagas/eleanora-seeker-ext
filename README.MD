# Eleanora Seeker

![Texto](./src/assets/Eleanora-seeker-logo.png)


Este é uma extensão que tem por finalidade enviar para um endpoint a lista de urls acessadas.
A idéia é contabilizar e fazer um relatório com fins de produtividade, para ter uma noção de como melhorar suas atividades.

### Passos para instalação
    git clone https://github.com/victorhdchagas/eleanora-seeker-ext.git eleanora-seeker
    cd ./eleanora-seeker
    npm run build
- Vá no navegador, abra a aba de extensões: vivaldi://extensions/ ou chrome://extensions/
- Habilite o **modo desenvolvedor**
- Clique em **Carregar sem compactação**
- Selecione a pasta


### Configuração
Para configurar o endpoint, basta clickar na extensão no cabeçalho do browser, e adicionar o endpoint.
Será exibido um icone vermelho ou azul se houver um endpoint POST /ping que retorne 200

### Dados enviados pela extensão
- Ao ativar uma guia nova ele pega essa informação e das guias que tem som ativo reproduzindo, encapsulam em um array e envia para o endpoint configurado através do método POST
O Objeto enviado é:
```javascript
    fetch(url,{
        method:"POST",
        body:JSON.stringify({
            urlList:["url1","url2","url3"]
        })
    }
```