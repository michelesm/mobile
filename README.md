
## Aplicativo de To-do List

Este projeto é um aplicativo To-Do List desenvolvido com Ionic, Angular e Firebase. Ele permite aos usuários criar, gerenciar e concluir tarefas, bem como gerenciar categorias. O aplicativo também usa o Firebase Remote Config para ativar ou desativar recursos da IU, como a visibilidade do logotipo.


## Características
- **Gerenciamento de Tarefas**: Crie, marque e exclua tarefas.
- **Gerenciamento de categorias**: crie, edite e exclua categorias de tarefas.
- **Integração com Firebase**: inclui o Firebase Remote Config para controlar funções de interface.
- **Multiplataforma**: Compilável para Android e iOS usando Cordova.

## Pré-requisitos
- Node.js (versão recomendada: 20.17.0)
- NPM (versão recomendada: 10.8.1)
- Angular CLI (versão recomendada: 18.2.1)
- Ionic CLI (versão recomendada: 7.x)
-Córdova CLI
- Android SDK para construção em Android
- Xcode para construção em iOS (somente macOS)
## Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/jcardonamde/To-Do-List_App.git
   cd todo-app

2. **Instalar dependências**
    ```bash
    npm install

3. **Configurar o Firebase**
- Crie um projeto no Firebase.
- Copie a configuração do Firebase para o arquivo src/environments/environment.ts e src/environments/environment.prod.ts
    ```bash
    export const environment = {
        production: false,
        firebaseConfig: {
            apiKey: "TU_API_KEY",
            authDomain: "TU_AUTH_DOMAIN",
            projectId: "TU_PROJECT_ID",
            storageBucket: "TU_STORAGE_BUCKET",
            messagingSenderId: "TU_MESSAGING_SENDER_ID",
            appId: "TU_APP_ID"
        }
    };

4. **Iniciar servidor de desenvolvimento**
    ```bash
    ionic serve


1. **Executar testes**
    ```bash
    npm run test
    ```

2. **Resultados dos testes **
Os resultados do teste serão exibidos no console ou no navegador se ele estiver configurado para ser executado em um ambiente gráfico.

