const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }

}

const generateLocationMessage = (username, crd) => {
    return {
        username,
        url: `https://google.com/maps?q=${crd.latitude},${crd.longitude}`,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
};