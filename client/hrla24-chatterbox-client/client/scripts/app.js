var app = {
  messages: [],
  friends: [],
  // server: 'http://parse.LA.hackreactor.com/chatterbox/classes/messages',
  server: 'http://127.0.0.1:3000/classes/messages',
  init: function() {
    $('.spinner').show();
    app.fetch();
    $('.submit').on('click', function(event) {
      $('.spinner').show();
      app.handleSubmit();
      event.preventDefault();
    });
    $('#send').submit(app.handleSubmit);
    $('#roomSelect').change(function(event) {
      app.renderMessages(event.target.value);
    });
    setInterval(() => {
      $('.spinner').show();
      $('#chats').empty();
      app.fetch();
    }, 25000);
  },
  send: function(message) {
    $('.spinner').hide();
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
        $('.spinner').hide();
        app.fetch();
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message', data);
      }
    });
  },
  fetch: function() {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: app.server,
      type: 'GET',
      contentType: 'application/json',
      // data : 'order=-createdAt',
      success: function (data) {
        $('.spinner').hide();
        // console.log(JSON.stringify(data.results));
        console.log('coming from success ajax callback', data);
        // app.messages = data.results;
        // data.results.forEach((message, index) => {
        //   message.index = index;
        // });
        app.messages = data.results;
        app.renderMessages();
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to fetch data', data);
        $('.spinner').hide();
      }
    });
  },
  clearMessages: function() {
    $('#chats').empty();
  },
  renderMessages: function(room) {
    app.clearMessages();
    let roomOptions = [];
    // filter out any message that has a script tag
    let filteredMessages = app.messages.filter((message) => {
      if (message.text){
        return !message.text.includes('<script>')
      }
    });
    //if it has a room, filter all the messages that their room is equal to the room passed as argument.
    if (room) {
      filteredMessages = filteredMessages.filter((message) => message.roomname === room);
    }
    // reduce through messages to get every element and return an array of room elements
    filteredMessages.forEach((message, index) => {
      let usernameClass;
      // add rooms
      if (!roomOptions.includes(message.roomname)) {
        $('#roomSelect').append(`<option>${app.escapeHTML(message.roomname)}</option>`);
      }
      // username css class
      usernameClass = app.friends.includes(app.escapeHTML(message.username)) ? 'friends' : 'username';
      // append each message
      $('#chats').append(`
        <li class="chat">
          <text  class="${usernameClass}">${app.escapeHTML(message.username)}</text>: ${app.escapeHTML(message.text)}
          <a href="#" id=${index} class="delete-message">[x] ${index}</a>
        </li>`);
    });
    // add click listeners
    $('.username').click(app.handleUsernameClick);
    $('.friends').click(app.handleUsernameClick);
    $('.delete-message').click(app.deleteMessage);
  },
  renderMessage: function(message) {
    $('#chats').append(`<p class="username">${message.text}</p>`);
    $('.username').click(app.handleUsernameClick);
    $('.delete-message').click(app.deleteMessage);
  },
  renderRoom: function(room) {
    if (app.messages) {
      app.renderMessages(room);
    }
    $('#roomSelect').append('<option>Test</option>');
  },
  handleUsernameClick: function(){
    // add new friends
    const friend = this.innerHTML;
    if (!app.friends.includes(friend)) {
      app.friends.push(friend);
    }
    app.renderMessages();
  },
  handleSubmit: function(){
    if ($('#message').val() === '') {
      alert('Fill out a message');
      return;
    }
    const message = {
      username: window.location.search.slice(10),
      text: $('#message').val(),
      roomname: $('#room').val() === '' ? $('#roomSelect').val() : $('#room').val()
    }
    app.send(message);
    $('#room').val('');
    $('#message').val('');
    app.renderMessages();
  },
  escapeHTML: function(str) {
    let escapes = {
      '&': '&amp',
      '<': '&lt',
      '>': '&gt',
      '"': ' &quot',
      "'": '&#x27',
      '/': '^#x2F',
      '$': '',
      '%': '',
      '': ''
    };

    if (typeof str === 'string') {
      let temp = str.split('');
      for (let i = 0; i < temp.length; i++) {
        if (escapes[temp[i]]) {
          temp[i] = escapes[temp[i]];
          return temp.join('');
        } else {
          return str;
        }
      }
    } else {
      return '\'' + str + '\'';
    }
  },
  deleteMessage: function(event) {
    //find message in server
      //splice out from our messages arr
      //re-fetch
      console.log(event.target.id);
    $.ajax({
      url: app.server,
      type: 'DELETE',
      contentType: 'application/json',
      data: JSON.stringify(event.target.id),
      success: function(data) {
        console.log('succes', data);
        app.fetch();
      },
      error: function(data) {
        console.log('error', data);
      }
    });
  }
};















