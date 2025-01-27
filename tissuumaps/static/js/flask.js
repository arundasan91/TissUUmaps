flask = {}

flask.init = function () {
    
    $(document).on( "click", ".layerSettingButton", function(){

        interfaceUtils.alert(
            `
            <iframe src='${$(this).data('source')}/info' style="width:100%;min-height:500px;"></iframe>
            `
        )
    } );
}

flask.standalone = {}

flask.standalone.init = function () {
    flask.init();
    flask.standalone.backend = null;
    new QWebChannel(qt.webChannelTransport, function (channel) {
        flask.standalone.backend = channel.objects.backend;
    });
    console.log("backend:",flask.standalone.backend);

    // Add layer button
    div = HTMLElementUtils.createElement({"kind":"div", extraAttributes:{"class":"px-3 my-2"}});
    button = HTMLElementUtils.createElement({"kind":"div", extraAttributes:{"class":"btn btn-primary btn-sm"}});
    button.innerHTML = "Add image layer";
    div.append(button)
    document.getElementById("image-overlay-panel").append(div)
    button.addEventListener("click", function(){
        flask.standalone.addLayer("");
    });
};

flask.standalone.addLayer = function (filename) {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const path = urlParams.get('path')
    flask.standalone.backend.addLayer(path, filename, function(layerImg) {
        if (layerImg["dzi"]!=null) {
            var layerName = layerImg["name"];
            var tileSource = layerImg["dzi"];
            tmapp.layers.push({
                name: layerName,
                tileSource: tileSource
            });
            i = tmapp.layers.length - 2;
            overlayUtils.addLayer(layerName, tileSource, i, true);
            overlayUtils.addLayerSettings(layerName, tileSource, i, true);
        }
    });
}

flask.standalone.saveProject = function () {
    state = projectUtils.getActiveProject();
    flask.standalone.backend.saveProject(JSON.stringify(state));
};

flask.standalone.exportToStatic = function () {
    var state = projectUtils.getActiveProject();
    var loadingModal =null;
    setTimeout(function() {
        loadingModal=interfaceUtils.loadingModal("Exporting to static web page")
    },0);
    setTimeout(function() {
        flask.standalone.backend.exportToStatic(JSON.stringify(state));
        setTimeout(function() {
            $(loadingModal).modal('hide');
            interfaceUtils.alert("Exporting done.")
        }, 500);
    }, 500);

};

flask.server = {}

flask.server.init = function () {
    flask.init();
    document.getElementById("menubar_File_Import").classList.add("d-none");
    document.getElementById("menubar_File_Export").classList.add("d-none");

    interfaceUtils.addMenuItem(["File","Save project"],function(){
        var modalUID = "messagebox";
        interfaceUtils.prompt("<b>Warning: only marker datasets converted into buttons will be saved.</b><br/><br/>Save project under the name:","NewProject","Save project")
        .then((filename) => {
            state = projectUtils.getActiveProject();
            state.filename = filename;
            if (filename.split('.').pop() != "tmap") {
                filename = filename + ".tmap"
            }
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            const path = urlParams.get('path')
            $.ajax({
                type: "POST",
                url: "/" + filename + "?path=" + path,
                // The key needs to match your method's input parameter (case-sensitive).
                data: JSON.stringify(state),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function(data) {
                    $('#loadingModal').modal('hide');
                },
                failure: function(errMsg) {
                    $('#loadingModal').modal('hide');
                    alert(errMsg);
                }
            });
        })
    },true);

    interfaceUtils.addMenuItem(["File","Open"],function(){
        var modalUID = "messagebox"
        button1=HTMLElementUtils.createButton({"extraAttributes":{ "class":"btn btn-primary mx-2"}})
        button1.innerText = "Cancel";
        button1.addEventListener("click",function(event) {
            $(`#${modalUID}_modal`).modal('hide');
        })
        buttons=divpane=HTMLElementUtils.createElement({"kind":"div"});
        buttons.appendChild(button1);
        content=HTMLElementUtils.createElement({"kind":"div"});
        content.innerHTML = "<iframe src='/filetree' width='100%' height='300px'></iframe>";
        interfaceUtils.generateModal ("Open file", content, buttons, modalUID);
    },true);

}

function toggleNavbar(turn_on = null) {
    return false;
}


/**
 * Save the current canvas as a PNG image
 */
 flask.savePNG=function() {
    // Create an empty canvas element
    var loading=interfaceUtils.loadingModal();
    var canvas = document.createElement("canvas");
    var ctx_osd = document.querySelector(".openseadragon-canvas canvas").getContext("2d");
    var ctx_webgl = document.querySelector("#gl_canvas").getContext("webgl");
    canvas.width = ctx_osd.canvas.width;
    canvas.height = ctx_osd.canvas.height;
    
    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    
    ctx.drawImage(ctx_osd.canvas, 0, 0);
    ctx.drawImage(ctx_webgl.canvas, 0, 0);
    console.log(canvas.width,canvas.height);
    var dataURL = canvas.toDataURL("image/png");
    
    var svgString = new XMLSerializer().serializeToString(document.querySelector('.openseadragon-canvas svg'));

    var DOMURL = self.URL || self.webkitURL || self;
    var img = new Image();
    var svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
    var url = DOMURL.createObjectURL(svg);
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        var png = canvas.toDataURL("image/png");
           
        var a = document.createElement("a"); //Create <a>
        a.href = png; //Image Base64 Goes here
        a.download = "TissUUmaps_capture.png"; //File name Here
        a.click(); //Downloaded file
        setTimeout(function(){$(loading).modal("hide");},500);
        DOMURL.revokeObjectURL(png);
    };
    img.src = url;
}

// Child website:
window.addEventListener("message", evt => {
    console.log("evt.data",evt.data) // "Question!"
    
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    var ctx_osd = document.querySelector(".openseadragon-canvas canvas").getContext("2d");
    var ctx_webgl = document.querySelector("#gl_canvas").getContext("webgl");
    canvas.width = ctx_osd.canvas.width;
    canvas.height = ctx_osd.canvas.height;
    
    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    
    ctx.drawImage(ctx_osd.canvas, 0, 0);
    ctx.drawImage(ctx_webgl.canvas, 0, 0);
    console.log(canvas.width,canvas.height);
    var dataURL = canvas.toDataURL("image/png");
    
    var svgString = new XMLSerializer().serializeToString(document.querySelector('.openseadragon-canvas svg'));

    var DOMURL = self.URL || self.webkitURL || self;
    var img = new Image();
    var svg = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
    var url = DOMURL.createObjectURL(svg);
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        var png = canvas.toDataURL("image/png");
           
        evt.source.postMessage({"img":png,"type":"screenshot" }, evt.origin);
        DOMURL.revokeObjectURL(png);
    };
    img.src = url;

    
});