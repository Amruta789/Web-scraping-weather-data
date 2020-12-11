// The functions necessary to display profile picture

// First, img is given via ejs variable
var imgSent = '<%= img %>';

$(document).ready(function() {
    // If it is blank, then <img> tag is hidden           
    if(imgSent === ''){
        $("#UploadedImg").hide();
    }
    else{
        $("#UploadedImg").show();
    }
    if (window.File && window.FileReader && window.FormData) {
        var $inputField = $("#profilepicture");
        // When choose file button is clicked and picture is submitted
        $inputField.on("change", function(e) {
            var file = e.target.files[0];

            if (file) {
                if (/^image\//i.test(file.type)) {
                    readFile(file);
                } else {
                    alert("Not a valid image!");
                }
            }
        
        });
    } else {
        alert("File upload is not supported!");
    }
    function readFile(file) {
        var reader = new FileReader();

        // First the file is processed. 
        reader.onloadend = function() {
            processFile(reader.result, file.type);
        };

        reader.onerror = function() {
            alert("There was an error reading the file!");
        };
        
        reader.readAsDataURL(file);
    }

    // Here image is resized according to specifications
    function processFile(dataURL, fileType) {
        var maxWidth = 500;
        var maxHeight = 500;

        var image = new Image();
        image.src = dataURL;

        image.onload = function() {
            var width = image.width;
            var height = image.height;
            var shouldResize = width > maxWidth || height > maxHeight;

            if (!shouldResize) {
                sendFile(dataURL,fileType);
                return;
            }

            var newWidth;
            var newHeight;

            if (width > height) {
                newHeight = height * (maxWidth / width);
                newWidth = maxWidth;
            } else {
                newWidth = width * (maxHeight / height);
                newHeight = maxHeight;
            }

            var canvas = document.createElement("canvas");

            canvas.width = newWidth;
            canvas.height = newHeight;

            var context = canvas.getContext("2d");

            context.drawImage(this, 0, 0, newWidth, newHeight);

            dataURL = canvas.toDataURL(fileType);

            sendFile(dataURL,fileType);
        };

        image.onerror = function() {
            alert("There was an error processing your file!");
        };
    }
    // Then image is stored in uploads/pics folder and path is stored in database 
    function sendFile(dataURL,fileType) {
        var time =new Date();
        time=time.getTime();

        var extn = fileType.substring(fileType.lastIndexOf("/")+1);
        var fileName='/uploads/pics/'+time+"."+extn;
        
        // /uploadPhoto route stores the picture path in database
        $.ajax({
            type: "POST",
            url: "/uploadPhoto",
            data: { 
                imgBase64: dataURL,
                fileType:fileType,
                fileName:fileName
            }
        }).done(function(o) {
            console.log('saved'); 
        });
    }
});