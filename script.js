document.querySelector('#form').addEventListener('submit', function (e) {
    e.preventDefault();

    let mapMaxCombo = document.querySelector('#maxcombo').value;
    let playerMaxCombo = document.querySelector('#pmaxcombo').value;
    let acc = document.querySelector('#acc').value;
    let miss = document.querySelector('#miss').value;

    document.querySelector('#result').innerHTML = (0.7 + (Math.pow(0.1, (mapMaxCombo / playerMaxCombo)) + Math.pow(0.2, (100 / acc)) / (Math.pow(1.01, miss)))).toString();
});
