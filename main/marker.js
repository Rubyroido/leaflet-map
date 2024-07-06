// функция сохранения маркера
function saveMarker(marker, data) {
    let markers = localStorage.getItem('markers');
    const markerData = {
        latlng: marker._latlng,
        popup: {
            type: data.type,
            name: data.name,
            description: data.description,
            color: data.color
        }
    };
    if (!markers) {
        markers = [];
    } else {
        markers = JSON.parse(markers);
    }
    const exists = markers.some((m) => JSON.stringify(m) === JSON.stringify(markerData));
    if (!exists) {
        markers.push(markerData);
    }
    localStorage.setItem('markers', JSON.stringify(markers));
}
// функция обновления сохраненных координат
function updateMarkerPosition(marker, coords) {
    let markers = JSON.parse(localStorage.getItem('markers'));
    const markerToUpdate = markers.find(m => {
        return m.latlng.lat === coords.lat && m.latlng.lng === coords.lng;
    })
    markerToUpdate.latlng = marker._latlng;

    localStorage.setItem('markers', JSON.stringify(markers));
}
// функция обновления попапа сохраненного маркера
function updateMarkerPopup(marker, data) {
    let markers = JSON.parse(localStorage.getItem('markers'));
    const markerToUpdate = markers.find(m => {
        return m.latlng.lat === marker._latlng.lat && m.latlng.lng === marker._latlng.lng;
    })
    markerToUpdate.popup.type = data.type;
    markerToUpdate.popup.name = data.name;
    markerToUpdate.popup.description = data.description;

    localStorage.setItem('markers', JSON.stringify(markers));
}
// функция удаления сохраненного маркера
function deleteSavedMarker(marker) {
    let markers = JSON.parse(localStorage.getItem('markers'));
    const markerToDelete = markers.find(m => {
        return m.latlng.lat === marker._latlng.lat && m.latlng.lng === marker._latlng.lng;
    })
    const index = markers.indexOf(markerToDelete);
    markers.splice(index, 1);

    localStorage.setItem('markers', JSON.stringify(markers));
}

export { saveMarker, updateMarkerPosition, updateMarkerPopup, deleteSavedMarker };