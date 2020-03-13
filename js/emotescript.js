$(document).ready(function () {
    const observer = lozad();

    $.ajax({
        dataType: 'json',
        url: 'https://yentis.github.io/emotes/emotes.json',
        success: function (data) {
            let list = document.getElementById('list');
            let newArray = [];
            
            data = Object.values(data);
            data.forEach((emote, index) => {
                newArray.push([index+1, emote]);
            });
            
            newArray.reverse().forEach((emote) => {
                emote.id = emote[0];
                emote.fullName = emote[1];
                let split = emote.fullName.split('.');
                emote.name = split[0];
                emote.extension = split[1];

                let container = createContainer(emote.name);
                list.appendChild(container);

                createAndAppendEmote(emote, container);
            });

            observer.observe();
        }
    });

    function createContainer(id) {
        let container = document.createElement('div');
        container.id = id;
        container.style.float = 'left';
        container.style.margin = '2px';
        return container;
    }

    function createAndAppendEmote(emote, container) {
        let imageUrl = 'https://yentis.github.io/emotes/images/' + emote.id + '.' + emote.extension;
        let image = document.createElement('img');
        let name = document.createElement('p');
        name.innerHTML = ' ' + emote.name;
        name.style.textAlign = 'center';
        image.classList.add('lozad');
        image.style.display = 'block';
        image.style.marginLeft = 'auto';
        image.style.marginRight = 'auto';
        image.setAttribute('data-src', imageUrl);
        image.height = 100;
        
        container.appendChild(image);
        container.appendChild(name);
        container.appendChild(document.createElement('br'));
    }

	const searchElement = $('#search');
    searchElement.keyup(search);
	searchElement.focus();

    function search() {
        let filter = $('#search')[0].value.toUpperCase();
        let images = $('#list').children();

        for (let i = 0; i < images.length; i++) {
            let name = images[i].id;
            if (name.toUpperCase().indexOf(filter) > -1) {
                images[i].style.display = 'block';
            } else {
                images[i].style.display = 'none';
            }
        }
    }
});
