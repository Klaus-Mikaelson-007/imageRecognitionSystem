$(document).ready(() => {
    $('#progress').hide()
})

$(document).ready(()=>{
    var year = new Date().getFullYear();
    $(".year").text(year);
})


form = document.querySelector('form');
image = document.querySelector('#image');
uploadImage = document.querySelector('#uploadImage');

prediction = document.querySelector('#prediction')
objects = document.querySelector('#objects')


image.onchange = evt => {
    const [file] = image.files
    if (file) {
        uploadImage.src = URL.createObjectURL(file)
        prediction.innerHTML='';
        objects.innerHTML='';
    }
}

const onSumbit = (e) => {
    e.preventDefault();

    $('#progress').show();

    console.log(image.files[0]);

    var data = new FormData()
    data.append('image', image.files[0])

    fetch("/", {
            method: "POST",
            "Content-Type": "multipart/form-data",
            body: data
        })
        .then(result => result.json())
        .then(result => {
            console.log("Success")
            $('#progress').hide()
            console.log(result)

            prediction.innerHTML = `<h3> This looks ${result.prediction.probability}% ${result.prediction.name} to me <h3>`;

            if (result.objects.length != 0) {

                const div = document.createElement('div')
                div.innerHTML = `<img src="/public/uploads/${image.files[0].name}">`
                uploadImage.append(div)
                objects.innerHTML = "<h5 class='mt-2'> This image may contain the following : </h5>"

                result.objects.forEach(e => {
                    const li = document.createElement('li');
                    li.innerHTML = `${e.name} (${e.score}%)`
                    objects.append(li)
                });

            }

        })
}

form.addEventListener('submit', onSumbit);