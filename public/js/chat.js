const socket = io();

const $messageForm = document.querySelector('#messageForm');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButon = $messageForm.querySelector('button');
const $sendLocation = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebar = document.querySelector('#sidebar');

// Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationTemplate = document.querySelector('#location-template').innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;


//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix:true});

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild;

    // height of the new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

// visible height
    const visibleHeight = $messages.offsetHeight;
    
    // Height of the messages container
    const containerHeight = $messages.scrollHeight;

    // How far have I scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }

    // console.log(newMessageMargin);
}


socket.on('message', (message)=>{
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({room, users}) =>{
    const html = Mustache.render($sidebarTemplate, {
        room, 
        users
    })
    $sidebar.innerHTML = html;
})


socket.on('location', (message)=>{
    // console.log(location)
    const html = Mustache.render($locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});


$messageForm.addEventListener('submit', handleSubmit)

function handleSubmit(e){
    e.preventDefault();
    $messageFormButon.setAttribute('disabled', 'disabled');
    const sendMessage = e.target.message.value;
    socket.emit('sendMessage', sendMessage, (error)=>{
        $messageFormButon.removeAttribute('disabled');
        $messageFormInput.value='';
        $messageFormInput.focus();
        if(error){
            return console.log(error)
        }
        console.log('message delivered');
    });
}

$sendLocation.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser');
    }

    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };
      
    function success(pos) {
        var crd = pos.coords;
        socket.emit('location', {
            latitude: crd.latitude, 
            longitude: crd.longitude
        }, (acknowledgement)=>{
            console.log(`Delivered: ${acknowledgement} `)
            $sendLocation.removeAttribute('disabled');
        });
    }
          
    function error(err) {
        console.warn(`Error(${err.code}): ${err.message}`);
    }
    
    $sendLocation.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition(success, error, options);



})


socket.emit('join', {username, room}, error =>{
    if(error){
        alert(error);
        location.href = '/';
    }
});

socket.on('roomData', ({room, users})=>{
    console.log(room);
    console.log(users)
})

// })