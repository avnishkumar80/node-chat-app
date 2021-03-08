const socket = io()
//elements

const $messageForm = document.querySelector('#message-form')
const $messageFormButton = document.querySelector('#send-button')
const $messageFormInput = document.querySelector('#message-input')
const $locationButton = document.querySelector('#share-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTeamplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options

const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})
console.log(room)

socket.on('message',(msg)=>{
    console.log(msg.text)
    const html = Mustache.render(messageTemplate,{
        username:msg.username,
        message:msg.text,
        createdAt:moment(msg.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)

})

socket.on('location',(location)=>{
    console.log(location)
    const html = Mustache.render(locationTeamplate,{
        username:location.username,
        url:location.url,
        createdAt:moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message = $messageFormInput.value

    socket.emit('sendMessage',message,(msg)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        console.log("message was delivered",msg)


    })
})

$locationButton.addEventListener('click',(e)=>{
    if(!navigator.geolocation){
        alert("GeoLocation is not supported by your browser")
    }

    $locationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
        $locationButton.removeAttribute('disabled')
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $locationButton.removeAttribute('disabled')
            console.log("location shared")
        })

    })
})

socket.emit('Join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})