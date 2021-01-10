$(document).ready(function () {
	const observer = lozad()
  let mangaList

  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');

  $.ajax({
    url: `https://gitlab.com/api/v4/snippets/${id}/raw`,
    success: (data) => {
    	mangaList = atob(data)
      mangaList = mangaList.substring(mangaList.indexOf('['), mangaList.lastIndexOf(']') + 1)
      mangaList = JSON.parse(mangaList)
      
      const listElement = document.getElementById('list')
      
      const tableElement = document.createElement('table')
      tableElement.classList.add('mdl-data-table', 'mdl-js-data-table', 'mdl-shadow--2dp')
      listElement.append(tableElement)
      
      const headerElement = document.createElement('thead')
      tableElement.append(headerElement)
      
      const headerRowElement = document.createElement('tr')
      headerElement.append(headerRowElement)
      
      createHeaderElement('Image', headerRowElement)
      createHeaderElement('Title', headerRowElement)
      createHeaderElement('Progress', headerRowElement)
      createHeaderElement('Status', headerRowElement)
      createHeaderElement('Rating', headerRowElement)
      createHeaderElement('Notes', headerRowElement)
      createHeaderElement('Site', headerRowElement)
      
      const bodyElement = document.createElement('tbody')
      tableElement.append(bodyElement)
      
      for (let i = 0; i < mangaList.length; i++) {
      	createBodyRowElement(mangaList[i], bodyElement)
      }
      
      observer.observe()
    },
    error: (error) => {
    	console.error('Failed to load snippet')
    }
  })
  
  const searchElement = $('#search')
  searchElement.keyup(search)
  searchElement.focus()
  
  function search() {
    const filter = searchElement[0].value.toLowerCase()

    for (let i = 0; i < mangaList.length; i++) {
      const element = $('td[id="' + mangaList[i].url + '"]')[0].parentElement
      if (mangaList[i].title.toLowerCase().includes(filter)) {
        element.style.display = 'table-row'
      } else {
        element.style.display = 'none'
      }
    }
  }
});

function createHeaderElement(textContent, rowElement) {
  const headerElement = document.createElement('th')
  headerElement.classList.add('mdl-data-table__cell--non-numeric')
  headerElement.textContent = textContent
  rowElement.append(headerElement)
}

function createBodyRowElement(item, bodyElement) {
	const bodyRowElement = document.createElement('tr')
  bodyElement.append(bodyRowElement)
  
  const imageTdElement = createTdElement(bodyRowElement)
  const imageElement = document.createElement('img')
  imageElement.classList.add('manga-image', 'lozad')
  imageElement.setAttribute('data-src', item.image)
  imageTdElement.append(imageElement)
  
  const titleTdElement = createTdElement(bodyRowElement)
  titleTdElement.id = item.url
  titleTdElement.textContent = item.title
  
  const progressTdElement = createTdElement(bodyRowElement)
  progressTdElement.textContent = item.read
  
  const statusTdElement = createTdElement(bodyRowElement)
  statusTdElement.textContent = item.status
  
  const ratingTdElement = createTdElement(bodyRowElement)
  ratingTdElement.textContent = item.rating ? `${item.rating}/10` : '-'
  
  const notesTdElement = createTdElement(bodyRowElement)
  notesTdElement.textContent = item.notes ? item.notes : '-'
  
  const siteTdElement = createTdElement(bodyRowElement)
  siteTdElement.textContent = item.site
}

function createTdElement(rowElement) {
	const dataElement = document.createElement('td')
  dataElement.classList.add('mdl-data-table__cell--non-numeric')
  rowElement.append(dataElement)
  
  return dataElement
}