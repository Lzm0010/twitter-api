//=========== VARIABLES ==========//

const socket = io.connect('http://localhost:3000');
const tweetButton = document.querySelector('.button-primary');
const $message = $('#tweet-textarea');
const characterLimit = 140;
let characters;
$('#tweet-char').append(characterLimit);


//=========== EVENT LISTENERS ==========//

//(js not jquery) add event listener to emit a message to server when
//tweet button is clicked
tweetButton.addEventListener('click', function(e){
  e.preventDefault();
  socket.emit('message', $message.val());
});

//jquery event listener to change number of characters left upon
//input change
$message.on('input', function(){
  characters = characterLimit - $message.val().length;
  $('#tweet-char').replaceWith(`<strong class="app--tweet--char" id="tweet-char">${characters}</strong>`);
});


//=========== SOCKET LISTENER ==========//

//client listens for tweet from server and then grabs data
//to display in html
socket.on('tweet', function(data){
  $tweet = $(`<li>
                <strong class="app--tweet--timestamp">now</strong>
                <a class="app--tweet--author">
                  <div class="app--avatar" style="background-image: url(${data.profilePic})">
                    <img src="${data.profilePic}">
                  </div>
                  <h4>${data.name}</h4>
                  <p>@${data.username}</p>
                </a>
                <p>${$message.val()}</p>
                <ul class="app--tweet--actions circle--list--inline">
                  <li>
                    <a class="app--reply">
                      <span class="tooltip">Reply</span>
                      <img src="images/reply.svg"/>
                    </a>
                  </li>
                  <li>
                    <a class="app--retweet">
                      <span class="tooltip">Retweet</span>
                      <img src="images/retweet.svg"/>
                      <strong>0</strong>
                    </a>
                  </li>
                  <li>
                    <a class="app--like">
                      <span class="tooltip">Like</span>
                      <img src="images/like.svg"/>
                      <strong>0</strong>
                    </a>
                  </li>
                </ul>
              </li>`);

  if ($message.val().length <= 140 && $message.val() !== ''){
    $('.app--tweet--list').prepend($tweet);
    $message.val("");
  } else {
    alert('Your tweet was too long or blank, try again!');
  }
});
