import { saveMarker, updateMarkerPosition, updateMarkerPopup, deleteSavedMarker } from './marker.js';

const redMarker = './assets/icons/red.png';
const blackMarker = './assets/icons/dark.png';
const greenMarker = './assets/icons/green.png';
const orangeMarker = './assets/icons/orange.png';

const popup = document.querySelector('.popup');
const form = popup.querySelector('.form');
const colorSelect = popup.querySelector('.select');
const closeButton = popup.querySelector('.button-close');
const filter = document.querySelector('.filter');
// создание карты
var map = L.map('map').setView([55.75, 37.62], 13);
let globalCoordinates;
// добавление тайла к карте
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
// обработчик клика по карте
function onMapClick(e) {
	globalCoordinates = e.latlng;
	openMarkerCreationPopup();
	closeButton.addEventListener('click', closePopup);
	form.addEventListener('submit', handleForm);
}
// отрисовка сохраненных маркеров и слушатель фильтра
window.addEventListener('DOMContentLoaded', () => {
	const markers = JSON.parse(localStorage.getItem('markers'));

	if (markers) {
		markers.forEach(marker => {
			createMarker(marker.latlng, marker.popup)
		})
	}

	filter.addEventListener('input', () => {
		filterMarkers(filter.value)
	})
})
// обработка формы попапа
function handleForm(e) {
	e.preventDefault;
	const formData = new FormData(form);
	const formDataObject = Object.fromEntries(formData);
	createMarker(globalCoordinates, formDataObject);

	resetPopup();
	form.removeEventListener('submit', handleForm)
}
// открывание попапа
function openMarkerCreationPopup() {
	popup.showModal();
}
// закрывание попапа
function closePopup() {
	popup.close();
	resetPopup();
	closeButton.removeEventListener('click', closePopup);
	form.removeEventListener('submit', handleForm);
}
// очистка попапа
function resetPopup() {
	const inputs = form.querySelectorAll('.input');
	inputs.forEach(input => {
		input.value = '';
	})
}
// функция фильтрации маркеров по описанию
function filterMarkers(text) {
	map.eachLayer((layer) => {
		if (layer._popup) {
			const content = layer._popup._content;
			const parser = new DOMParser();
			const doc = parser.parseFromString(content, 'text/html');

			const descriptionElement = doc.querySelector('.span.description');
			const description = descriptionElement ? descriptionElement.textContent.trim() : '';

			if (!description.toLowerCase().includes(text.toLowerCase())) {
				layer.setOpacity(0)
			} else {
				layer.setOpacity(1)
			}
		}
	})
}
// функция создания маркера
function createMarker(x, data) {
	let coordinates = x;
	let color = data.color;
	let currentIconUrl;
	switch (color) {
		case 'red':
			currentIconUrl = redMarker;
			break;
		case 'black':
			currentIconUrl = blackMarker;
			break;
		case 'green':
			currentIconUrl = greenMarker;
			break;
		case 'orange':
			currentIconUrl = orangeMarker;
			break;
		default:
			currentIconUrl = redMarker;
			break;
	}
	const icon = L.icon({
		iconUrl: currentIconUrl,
		iconSize: [35, 35]
	})
	resetPopup();
	const marker = L.marker(x, { draggable: true, icon: icon }).addTo(map);
	let type = data.type;
	let name = data.name;
	let description = data.description;
	marker.bindPopup(`
	<div class="marker" id="${marker._leaflet_id}">
	<span>Тип: <span contentEditable="true" class="span type">${type}</span></span>
	<span>Название: <span contentEditable="true" class="span name">${name}</span></span>
	<span>Описание: <span contentEditable="true" class="span description">${description}</span></span>
	<button class="button-delete">Удалить</button>
	</div>
	`, {
		maxWidth: 300,
		minWidth: 150
	});
	// изменение попапа маркера
	marker.on('popupopen', () => {
		const spans = document.getElementById(`${marker._leaflet_id}`).querySelectorAll('.span');
		spans.forEach((span, index) => {

			if (index === 0) {
				span.textContent = type;
			} else if (index === 1) {
				span.textContent = name;
			} else if (index === 2) {
				span.textContent = description;
			}

			span.addEventListener('input', () => {
				if (index === 0) {
					type = span.textContent;
				} else if (index === 1) {
					name = span.textContent;
				} else if (index === 2) {
					description = span.textContent;
				}
				updateMarkerPopup(marker, { type, name, description })
			})
		})
		// удаление маркера
		const deleteButton = document.getElementById(`${marker._leaflet_id}`).querySelector('.button-delete');
		deleteButton.addEventListener('click', () => {
			deleteSavedMarker(marker)
			map.removeLayer(marker);
		})
	})
	// перетаскивание маркера
	marker.on('dragend', () => {
		updateMarkerPosition(marker, coordinates);
		coordinates = marker._latlng;
	})
	// кеширование маркера
	saveMarker(marker, { type, name, description, color });
}
// создание при клике по карте
map.on('click', onMapClick);