const socket = io();

// ================================== Elements ==================================
const $form = document.querySelector('form');
const $formInput = document.querySelector('#message');
const $formSendButton = document.querySelector('button');
const $sendLocationButton = document.querySelector('#send_location');
const $msgContainer = document.querySelector('#msg_container');

// ================================== Templates ==================================
const msgTemplate = document.querySelector('#message_template').innerHTML
const locationTemplate = document.querySelector('#location_template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar_template').innerHTML

// ================================== options ==================================
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// Autoscroll option: setting as per user wants to see at top or bottom when new message comes
const autoScroll = () => {
    // New message element
    const $newMessage = $msgContainer.lastElementChild

    // Height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offSetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $msgContainer.offsetHeight

    // Height of message container
    const containerHeight = $msgContainer.scrollHeight

    // How far have I scrolled ?
    const scrollOffset = $msgContainer.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $msgContainer.scrollTop = $msgContainer.scrollHeight
    }
}

// ================================== recieving data from server for messages ==================================
socket.on('message', (data) => {
    console.log(data);
    const html = Mustache.render(msgTemplate, {
        username: data.username,
        template_msg: data.text,
        createdAt: moment(data.createdAt).format("h:mm a")
    });
    $msgContainer.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

// ================================== recieving data from server for location ==================================
socket.on('locationMessage', (locationData) => {
    console.log(locationData);
    const html = Mustache.render(locationTemplate, {
        username: locationData.username,
        location_url: locationData.url,
        createdAt: moment(locationData.createdAt).format('h:mm a')
    });
    $msgContainer.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

// =============================== recieve data from server for sidebar rooms ===============================
socket.on('roomData', ({ room, roomUsers }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        roomUsers
    });
    document.querySelector('#sidebar').innerHTML = html;
})

// ================================== submitting the form and sending data to server ==================================
$form.addEventListener('submit', (e) => {
    e.preventDefault();

    $formSendButton.setAttribute('disabled','disabled');

    const message = $formInput.value;
    socket.emit('sendMessage', message, (error) => {
        $formSendButton.removeAttribute('disabled');
        $formInput.value = '';
        $formInput.focus();

        if(error) return alert(error);

        console.log('The message is delivered!');
    });
})

// ================================== sending location data to server ==================================
$sendLocationButton.addEventListener('click', () => {
    if(!navigator.geolocation) return alert('Geolocation is not supported by your browser.');

    $sendLocationButton.setAttribute('disabled','disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('Geolocation',{
            lat: position.coords.latitude,
            long: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled');
            console.log('Location shared!');
        })
    })
})

// ================================== sending query string data when new user join with same credentials ==================================
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});