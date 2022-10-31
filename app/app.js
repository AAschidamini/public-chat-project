(function () {
  var socket = io();

  /** Componente de exibição de mensagem */
  Vue.component("message", {
    props: ["messageData"],
    template: ` <div class="media-content">
                        <div class="content">
                            <p>
                                <strong>{{messageData.user}}</strong> <small>{{messageData.date}}</small>
                                <br>
                                {{messageData.text}}
                            </p>
                        </div>
                    </div>`,
  });

  /** Input de envio de mensagem */
  Vue.component("input-message", {
    data: function () {
      return {
        message: "",
      };
    },
    template: ` <div class="chat-input">
                    <input v-model="message" v-on:keydown.enter="send" class="msg-input" placeholder="Escreva sua mensagem">
                    <button v-on:click="send" :disabled="!message" class="msg-btn">Enviar</button>
                        
                </div>`,
    methods: {
      send: function () {
        if (this.message.length > 0) {
          this.$emit("send-message", this.message);
          this.message = "";
        }
      },
    },
  });

  /** Componente de preenchimento do input do usuário */
  Vue.component("input-name", {
    props: ["isLogged"],
    data: function () {
      return {
        userName: "",
      };
    },
    template: `<div class="form-join" v-show="!isLogged">
                        <div class="container-box">
                          <h1>Talk Auxilium</h1>
                            <div>
                                <input v-model="userName" v-on:keydown.enter="sendUserName" class="joinInput" placeholder="Nome">
                            </div>
                            <div>
                                <button v-on:click="sendUserName" :disabled="!userName" class="btn">Entrar</button>
                            </div>
                        </div>
                    </div>`,
    methods: {
      sendUserName: function () {
        if (this.userName.length > 0) {
          this.$emit("set-name", this.userName);
        }
      },
    },
  });

  /** Componente de usuários */
  Vue.component("users", {
    props: ["users"],
    template: ` <div class="users">
                        <h4 class="title-users">Usuários online ({{users.length}})</h4>
                        <ul>
                            <li v-for="user in users">
                                <div class="">
                                    <div class="content">
                                        <p>
                                            <strong>{{user.name}}</strong>
                                        </p>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>`,
  });

  /** Instância Vue */
  var app = new Vue({
    el: "#app",
    data: {
      messages: [],
      users: [],
      userName: "",
      isLogged: false,
    },
    methods: {
      sendMessage: function (message) {
        if (message) {
          socket.emit("send-msg", { message: message, user: this.userName });
        }
      },
      setName: function (userName) {
        this.userName = userName;
        this.isLogged = true;
        socket.emit("add-user", this.userName);
      },
      scrollToEnd: function () {
        var container = this.$el.querySelector(".messages");
        container.scrollTop = container.scrollHeight;
      },
    },
    updated() {
      this.scrollToEnd();
    },
  });

  /** Eventos do client socket */

  socket.on("read-msg", function (message) {
    app.messages.push({
      text: message.text,
      user: message.user,
      date: message.date,
    });
  });

  socket.on("user-connected", function (userId) {
    app.users.push(userId);
  });

  socket.on("init-chat", function (messages) {
    app.messages = messages;
  });

  socket.on("update-users", function (users) {
    app.users = users;
  });
})();
