function editStar(starID) {
    ajax('edit_star.php', 'starID=' + starID)
}

function ajax(page, params) {
    let url = page + '?' + params

    let xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.send()
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) reloadPage()
    }
}

function reloadPage() {
    window.location.href = `${window.location.href}`
}