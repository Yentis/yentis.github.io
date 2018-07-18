$(document).ready(function () {
    $.ajax({
        dataType: "json",
        url: "https://yentis.github.io/emotes/emotes.json",
        success: function (data) {
            for (let key in data) {
                if (data.hasOwnProperty(key)) {
                    let split = data[key].split('.');
                    let imageUrl = "https://yentis.github.io/emotes/images/" + key + '.' + split[1];
                    let image = document.createElement('img');
                    let name = document.createElement('p');
                    name.style.display = 'inline';
                    name.innerHTML = ' ' + split[0];
                    image.src = imageUrl;
                    image.width = 100;

                    document.getElementById('list').appendChild(image);
                    document.getElementById('list').appendChild(name);
                    document.getElementById('list').appendChild(document.createElement('br'));
                }
            }
        }
    });
});