$(document).ready(function () {
    const observer = lozad();

    const inputElement = $('#input');
    const shareElement = $('#share');
    const listElement = $('#list');

    inputElement.keyup(parseInputElement);
    inputElement.focus();

    shareElement.keyup(parseShareElement);
    
    function parseInputElement() {
        const value = inputElement[0].value;
        let characters = value.split('\n');

        characters = characters.filter(character => character.trim() !== '').map(character => {
            const imageText = character.substring(character.lastIndexOf('-') + 1);
            const imageUrl = imageText.substring(1).trim();
            character = character.replace(imageText, '');

            const rankText = character.substring(0, Math.max(0, character.indexOf('-')));
            const rank = rankText.substring(rankText.indexOf('#') + 1).trim();
            character = character.replace(rankText, '');

            const kakeraMatch = character.substring(0, character.length - 1).trim().match(/\b\d+ ka\b/g);
            const kakera = (kakeraMatch !== null && kakeraMatch.length > 0) ? kakeraMatch[kakeraMatch.length - 1] : 0;
            character = character.replace(kakera + ' ka', '');

            const nameText = character.substring(0, Math.max(0, character.lastIndexOf('-')));
            const name = nameText.substring(nameText.indexOf('-') + 1, nameText.indexOf('|') > 0 ? nameText.indexOf('|') : nameText.length - 1).trim();
            character = character.replace(nameText, '');

            return {
                rank: parseInt(rank ? rank : 0),
                name,
                imageUrl,
                kakera: parseInt(kakera)
            };
        });

        if (characters.length !== 0) {
            shareElement.val(JSON.stringify(characters));
            if (!shareElement.parent().hasClass('is-dirty')){
                shareElement.parent().addClass('is-dirty');
            }

            showImages(characters);
        }
    }

    function parseShareElement() {
        const value = shareElement[0].value;
        let characters;

        try {
            characters = JSON.parse(value);
        } catch (exception) {
            return;
        }

        showImages(characters);
    }

    function showImages(characters) {
        listElement.empty();

        characters.forEach(character => {
            const container = createContainer(character.name);
            listElement.append(container);

            createAndAppendCharacter(character, container);
        });

        observer.observe();
    }

    function createContainer(id) {
        const container = document.createElement('div');
        container.id = id;
        container.style.float = 'left';
        container.style.margin = '2px';
        return container;
    }

    function createAndAppendCharacter(character, container) {
        if (character.name) {
            const name = document.createElement('p');
            name.innerHTML = '<b>#' + character.rank + '</b><br>' + character.name;
            name.style.textAlign = 'center';
            container.appendChild(name);
        }

        if (character.imageUrl) {
            const image = document.createElement('img');

            image.classList.add('lozad');
            image.style.display = 'block';
            image.style.marginLeft = 'auto';
            image.style.marginRight = 'auto';
            image.setAttribute('data-src', character.imageUrl);
            image.height = 200;
            container.appendChild(image);
        }

        if (character.kakera) {
            const price = document.createElement('p');
            price.innerHTML = character.kakera + ' ka';
            price.style.textAlign = 'center';
            container.appendChild(price);
        }

        container.appendChild(document.createElement('br'));
    }
});
