$(document).ready(function () {
    $.ajax({
        dataType: "json",
        url: "https://yentis.github.io/emotes/emotes.json",
        success: function (data) {
            let list = document.getElementById('list');
            let curElem;
            let newArray = [];
            
            data = Object.values(data);
            data.forEach((emote, index) => {
                newArray.push([index+1, emote]);
            });
            
            newArray.reverse().forEach((emote) => {
                let emoteID = emote[0],
                    emoteName = emote[1];
                let split = emoteName.split('.');
                let newElem = document.createElement('div');
                newElem.id = split[0];
                newElem.style.float = 'left';
                newElem.style.margin = '2px';
                list.appendChild(newElem);
                curElem = newElem;

                let imageUrl = "https://yentis.github.io/emotes/images/" + emoteID+ '.' + split[1];
                let image = document.createElement('img');
                let name = document.createElement('p');
                name.innerHTML = ' ' + split[0];
                name.style.textAlign = 'center';
                image.style.display = 'block';
                image.style.marginLeft = 'auto';
                image.style.marginRight = 'auto';
                image.src = imageUrl;
                image.height = 100;

                curElem.appendChild(image);
                curElem.appendChild(name);
                curElem.appendChild(document.createElement('br'));
            });
        }
    });
});
