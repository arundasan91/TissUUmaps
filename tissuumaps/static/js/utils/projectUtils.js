/**
 * @file projectUtils.js
 * @author Christophe Avenel
 * @see {@link projectUtils}
 */

/**
 * @namespace projectUtils
 * @version projectUtils 2.0
 * @classdesc The root namespace for projectUtils.
 */
var projectUtils = {
     _activeState:{},
     _hideCSVImport: false,
     _settings:[
        {
            "module":"dataUtils",
            "function":"_autoLoadCSV",
            "value":"boolean",
            "desc":"Automatically load csv with default headers"
        },
        {
            "module":"markerUtils",
            "function":"_startMarkersOn",
            "value":"boolean",
            "desc":"Load with all markers visible"
        },
        {
            "function": "_linkMarkersToChannels",
            "module": "overlayUtils",
            "value": "boolean",
            "desc": "Link markers to channels in slider"
        },
        {
            "function": "_hideCSVImport",
            "module": "projectUtils",
            "value": "boolean",
            "desc": "Hide CSV file input on project load"
        }
     ]
}

/**
 * This method is used to save the TissUUmaps state (gene expression, cell morphology, regions) */
 projectUtils.saveProject = function(urlProject) {
    interfaceUtils.prompt("Save project under the name:","NewProject")
    .then((filename) => {
        var state = projectUtils.getActiveProject();
        state.filename = filename;

        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 4));
        var dlAnchorElem=document.createElement("a");
        dlAnchorElem.setAttribute("hidden","");
        dlAnchorElem.setAttribute("href",     dataStr     );
        dlAnchorElem.setAttribute("download", filename + ".tmap");
        document.body.appendChild(dlAnchorElem);
        dlAnchorElem.click();
        document.body.removeChild(dlAnchorElem);
    })
}

projectUtils.getActiveProject = function () {
    state = projectUtils._activeState;
    state.regions = regionUtils._regions;
    state.layers = tmapp.layers;
    state.filters = filterUtils._filtersUsed;
    state.layerFilters = filterUtils._filterItems;
    state.compositeMode = filterUtils._compositeMode;
    state.layerOpacities = {}
    state.layerVisibilities = {}
    tmapp.layers.forEach(function(layer, i) {
        state.layerOpacities[i] = $("#opacity-layer-"+i).val();
        state.layerVisibilities[i] = $("#visible-layer-"+i).is(":checked");
    });
    return state;
}


/**
 * This method is used to load the TissUUmaps state (gene expression, cell morphology, regions) */
 projectUtils.makeButtonFromTab = function(dataset) {
    csvFile = document.getElementById(dataset + "_csv").value.replace(/^.*[\\\/]/, '');
    if (!csvFile) {
        if (dataUtils.data[dataset]) {
            csvFile = dataUtils.data[dataset]["_csv_path"];
        }
        else {
            interfaceUtils.alert("Select a csv file first!");
            return;
        }
    }
    var modalUID = "default";
    button1=HTMLElementUtils.createButton({"id":generated+"_marker-tab-button","extraAttributes":{ "class":"btn btn-secondary mx-2", "data-bs-dismiss":"modal"}})
    button1.innerText = "Cancel";
    button2=HTMLElementUtils.createButton({"id":generated+"_marker-tab-button","extraAttributes":{ "class":"btn btn-primary mx-2"}})
    button2.innerText = "Generate button";
    buttons=divpane=HTMLElementUtils.createElement({"kind":"div"});
    buttons.appendChild(button1);
    buttons.appendChild(button2);

    button1.addEventListener("click",function(event) {
        $(`#${modalUID}_modal`).modal('hide');
    })
    button2.addEventListener("click",function(event) {
        function UrlExists(url)
        {
            var http = new XMLHttpRequest();
            http.open('HEAD', url, false);
            http.send();
            return http.status!=404;
        }
        path = document.getElementById("generateButtonPath").value
        if (path.includes("[")) {path = JSON.parse(path)}
        if( Object.prototype.toString.call( path ) === '[object Array]' ) {
            _exists = path.every(UrlExists);
        }
        else {
            _exists = UrlExists(path);
        }
        var title = document.getElementById("generateButtonTitle").value
        var comment = document.getElementById("generateButtonComment").value
        if (!_exists) {
            interfaceUtils.confirm("Warning, path doesn't seem accessible on the server.\n\nAre you sure you want to continue?")
            .then(function(_confirm) {
                if (_confirm) {
                    projectUtils.makeButtonFromTabAux(dataset, path, title, comment);
                    $(`#${modalUID}_modal`).modal('hide');
                }
            })
            return;
        }
        projectUtils.makeButtonFromTabAux(dataset, path, title, comment);
        $(`#${modalUID}_modal`).modal('hide');
    })
    
    content=HTMLElementUtils.createElement({"kind":"div"});
        row0=HTMLElementUtils.createElement({"kind":"p", "extraAttributes":{"class":"text-danger"}});
        row0.innerText = "Warning, the csv file must be accessible on the server side."
        row1=HTMLElementUtils.createRow({});
            col11=HTMLElementUtils.createColumn({"width":12});
                label111=HTMLElementUtils.createElement({"kind":"label", "extraAttributes":{ "for":"generateButtonPath" }});
                label111.innerText="Relative path to the csv file (on the server side)"
                file112=HTMLElementUtils.createElement({"kind":"input", "id":"generateButtonPath", "extraAttributes":{ "class":"form-text-input form-control", "type":"text", "value":csvFile}});

        row2=HTMLElementUtils.createRow({});
            col21=HTMLElementUtils.createColumn({"width":12});
                label211=HTMLElementUtils.createElement({"kind":"label","extraAttributes":{"for":"generateButtonTitle" }});
                label211.innerText="Button inner text";
                select212=HTMLElementUtils.createElement({"kind":"input", "id":"generateButtonTitle", "extraAttributes":{ "class":"form-text-input form-control", "type":"text", "value":"Download data"} });

        row3=HTMLElementUtils.createRow({});
        col31=HTMLElementUtils.createColumn({"width":12});
            label311=HTMLElementUtils.createElement({"kind":"label","extraAttributes":{"for":"generateButtonComment" }});
            label311.innerText="Comment (will be displayed on the right of the button)";
            select312=HTMLElementUtils.createElement({"kind":"input", "id":"generateButtonComment", "extraAttributes":{ "class":"form-text-input form-control", "type":"text", "value":""} });
    
    content.appendChild(row0);
    content.appendChild(row1);
        row1.appendChild(col11);
            col11.appendChild(label111);
            col11.appendChild(file112);
    content.appendChild(row2);
        row2.appendChild(col21);
            col21.appendChild(label211);
            col21.appendChild(select212);
    content.appendChild(row3);
        row3.appendChild(col31);
            col31.appendChild(label311);
            col31.appendChild(select312);

    title = "Generate button from tab"
    interfaceUtils.generateModal(title, content, buttons);
 }


projectUtils.updateMarkerButton = function(dataset) {
    var data_obj = dataUtils.data[dataset];
    var markerFile = projectUtils._activeState.markerFiles[data_obj["fromButton"]];
    var headers = interfaceUtils._mGenUIFuncs.getTabDropDowns(dataset);
    markerFile.expectedHeader = Object.assign({}, ...Object.keys(headers).map((k) => ({[k]: headers[k].value})));
    var radios = interfaceUtils._mGenUIFuncs.getTabRadiosAndChecks(dataset);
    markerFile.expectedRadios = Object.assign({}, ...Object.keys(radios).map((k) => ({[k]: radios[k].checked})));
}

projectUtils.makeButtonFromTabAux = function (dataset, csvFile, title, comment) {
    buttonsDict = {};

    if (!csvFile)
        return;

    markerFile = {
        "path": csvFile,
        "comment":comment,
        "title":title,
        "hideSettings":true,
        "autoLoad":false,
        "uid":dataset
    };
    tabName = document.getElementById(dataset + "_tab-name").value;
    markerFile.name = tabName;
    headers = interfaceUtils._mGenUIFuncs.getTabDropDowns(dataset);
    markerFile.expectedHeader = Object.assign({}, ...Object.keys(headers).map((k) => ({[k]: headers[k].value})));
    radios = interfaceUtils._mGenUIFuncs.getTabRadiosAndChecks(dataset);
    markerFile.expectedRadios = Object.assign({}, ...Object.keys(radios).map((k) => ({[k]: radios[k].checked})));
    if (!projectUtils._activeState.markerFiles) {
        projectUtils._activeState.markerFiles = [];
    }
    projectUtils._activeState.markerFiles.push(markerFile);
    if( Object.prototype.toString.call( markerFile.path ) === '[object Array]' ) {
        interfaceUtils.createDownloadDropdownMarkers(markerFile);
    }
    else {
        interfaceUtils.createDownloadButtonMarkers(markerFile);
    }
}

projectUtils.loadProjectFile = function() {
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
        // getting a hold of the file reference
        var file = e.target.files[0]; 

        // setting up the reader
        var reader = new FileReader();
        reader.readAsText(file,'UTF-8');

        // here we tell the reader what to do when it's done reading...
        reader.onload = readerEvent => {
            var content = readerEvent.target.result; // this is the content!
            projectUtils.loadProject(JSON.parse(content));
        }
    }
    input.click();

}

projectUtils.loadProjectFileFromServer = function(path) {
    $.getJSON(path, function(json) {
        projectUtils.loadProject(json);
    })
    .fail(function(jqXHR, textStatus, errorThrown) { interfaceUtils.alert("error: " + textStatus); })
}

/**
 * This method is used to load the TissUUmaps state (gene expression, cell morphology, regions) */
 projectUtils.saveProjectWindow = function() {
    return projectUtils.saveProject();
    
    //TODO

    settingsModal = document.getElementById("settingsModal");
    if (! settingsModal) {
        var div = document.createElement('div');
        div.innerHTML = `<div class="modal in" id="settingsModal" tabindex="-1" role="dialog" aria-labelledby="modalLabelSmall" aria-hidden="true" style="display:None;">
            <div class="modal-dialog">
                <div class="modal-content">
                    
                    <div class="modal-header">
                        <h5 class="modal-title" id="modalLabelSmall">Save TMAP project</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" onclick="$('#settingsModal').modal('hide');;"></button>
                    </div>
                    
                    <div class="modal-body" id="settingsModalContent">
                    </div>

                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                      <button type="button" class="btn btn-primary" onclick="projectUtils.saveProject();">Save project</button>
                    </div>
                
                </div>
            </div>
        </div>`;
        document.body.appendChild(div);
    }
    
    settingsModal = document.getElementById("settingsModal");
    settingsModalContent = document.getElementById("settingsModalContent");
    settingsModalContent.innerHTML = "";
    projectUtils._settings.forEach(function(setting, index) {
        row = HTMLElementUtils.createRow();
        checkbox = HTMLElementUtils.inputTypeCheckbox({
            id: "settings-" + index,
            class: "setting-value",
            checked: window[setting.module][setting.function],
            extraAttributes: {
                module: setting.module,
                function: setting.function
            },
            eventListeners: { click: function () { 
                // TODO: Remove JQuery dependency here?
                window[setting.module][setting.function] = this.checked;
                if (!projectUtils._activeState.settings)
                    projectUtils._activeState.settings = [];
                projectUtils._activeState.settings.forEach(function(settingSaved, index, object) {
                    if (settingSaved.function == setting.function && settingSaved.function == setting.function) {
                        object.splice(index, 1);
                    }
                });
                projectUtils._activeState.settings.push(
                    {
                        "module":setting.module,
                        "function":setting.function,
                        "value":window[setting.module][setting.function]
                    }
                );
                console.dir(projectUtils._activeState.settings);
             } }
        });
        row.appendChild(checkbox);
        desc = HTMLElementUtils.createElement({ kind: "span", innerHTML:  "<label style='cursor:pointer' for='settings-" + index + "'>&nbsp;&nbsp;"+setting.desc+"</label>"});
        row.appendChild(desc);
        settingsModalContent.appendChild(row);
    })
    settingsModal.style.display="block";
 }

/**
 * This method is used to load the TissUUmaps state (gene expression, cell morphology, regions) */
 projectUtils.loadProject = function(state) {
    /*
    {
        markerFiles: [
            {
                path: "my/server/path.csv",
                title: "",
                comment: ""
            }
        ],
        CPFiles: [],
        regionFiles: [],
        layers: [
            {
                name:"",
                path:""
            }
        ],
        filters: [
            {
                name:"",
                default:"",
            }
        ],
        compositeMode: ""
    }
    */
    document.getElementById("divMarkersDownloadButtons").innerHTML = "";
    /*if (state.tabs) {
        state.tabs.forEach(function(tab, i) {
            if (tab.title) {document.getElementById("title-tab-" + tab.name).innerHTML = tab.title}
            if (tab.visible === false) {document.getElementById("title-tab-" + tab.name).style.display="none"}
        });
    }*/

    if (state.regions && Object.keys(state.regions).length > 0) {
        regionUtils.JSONValToRegions(state.regions);
    }
    if (state.regionFile) {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const path = urlParams.get('path')
        if (path != null) {
            regionUtils.JSONToRegions(path + "/" + state.regionFile);
        }
    }
    projectUtils._activeState = state;
    tmapp.fixed_file = "";
    if (state.compositeMode) {
        filterUtils._compositeMode = state.compositeMode;
    }
    if (state.markerFiles) {
        state.markerFiles.forEach(function(markerFile, buttonIndex) {
            markerFile["fromButton"] = buttonIndex;
            if (markerFile.expectedCSV) {
                projectUtils.convertOldMarkerFile(markerFile);
                state.hideTabs = true;
            }
            if( Object.prototype.toString.call( markerFile.path ) === '[object Array]' ) {
                interfaceUtils.createDownloadDropdownMarkers(markerFile);
            }
            else {
                interfaceUtils.createDownloadButtonMarkers(markerFile);
            }
        });
    }
    if (state.regionFiles) {
        state.regionFiles.forEach(function(regionFile) {
            if( Object.prototype.toString.call( regionFile.path ) === '[object Array]' ) {
                interfaceUtils.createDownloadDropdownRegions(regionFile);
            }
            else {
                interfaceUtils.createDownloadButtonRegions(regionFile);
            }
        });
    }
    if (state.filename) {
        tmapp.slideFilename = state.filename;
        document.getElementById("project_title").innerHTML = state.filename;
    }
    if (state.link) {
        document.getElementById("project_title").href = state.link;
        document.getElementById("project_title").target = "_blank";
    }
    if (state.settings) {
        projectUtils.applySettings(state.settings);
    }
    if (state.hideTabs) {
        document.getElementById("level-1-tabs").classList.add("d-none");
    }
    if (state.menuButtons) {
        state.menuButtons.forEach(function(menuButton, i) {
            interfaceUtils.addMenuItem([menuButton.text], function(){ window.open(menuButton.url, '_self').focus();});
        });
    }
    projectUtils.loadLayers(state);
    
    //tmapp[tmapp["object_prefix"] + "_viewer"].world.resetItems()
}

/**
 * This method is used to load the TissUUmaps layers from state */
 projectUtils.loadLayers = function(state) {
    tmapp.layers = [];
    subfolder = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
    state.layers.forEach(function(layer) {
        pathname = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
        tmapp.layers.push(
            {name: layer.name, tileSource: layer.tileSource}
        )
    });
    if (state.filters) {
        filterUtils._filtersUsed = state.filters;
        $(".filterSelection").prop("checked",false);
        state.filters.forEach(function(filterused, i) {
            $("#filterCheck_" + filterused).prop("checked",true);
        });
    }
    if (state.layerFilters) {
        filterUtils._filterItems = state.layerFilters;
    }
    tmapp[tmapp["object_prefix"] + "_viewer"].world.removeAll();
    overlayUtils.addAllLayers();
    if (state.layerOpacities && state.layerVisibilities) {
        $(".visible-layers").prop("checked",true);$(".visible-layers").click();
    }
    if (state.compositeMode) {
        filterUtils._compositeMode = state.compositeMode;
        filterUtils.setCompositeOperation();
    }
    /*if (projectUtils._hideCSVImport) {
        document.getElementById("ISS_data_panel").style.display="none";
    }*/
    setTimeout(function(){
        if (state.rotate) {
            var op = tmapp["object_prefix"];
            var vname = op + "_viewer";
            tmapp[vname].viewport.setRotation(state.rotate);
        }
        if (state.boundingBox) {
            setTimeout(function() {
                tmapp[tmapp["object_prefix"] + "_viewer"].viewport.fitBounds(new OpenSeadragon.Rect(state.boundingBox.x, state.boundingBox.y, state.boundingBox.width, state.boundingBox.height), false);
            },1000);
        }
        if (state.compositeMode) {
            filterUtils._compositeMode = state.compositeMode;
            filterUtils.setCompositeOperation();
        }
        if (state.layerOpacities && state.layerVisibilities) {
            tmapp.layers.forEach(function(layer, i) {
                $("#opacity-layer-"+i).val(state.layerOpacities[i]);
                if (state.layerVisibilities[i] != 0) {
                    $("#visible-layer-"+i).click();
                }
            });
        }
    },300);
}

projectUtils.convertOldMarkerFile = function(markerFile) {
    if (!markerFile.expectedHeader)
        markerFile.expectedHeader = {}
    markerFile.expectedHeader.X = markerFile.expectedCSV.X_col;
    markerFile.expectedHeader.Y = markerFile.expectedCSV.Y_col;
    if (markerFile.expectedCSV.key == "letters") {
        markerFile.expectedHeader.gb_col = markerFile.expectedCSV.group;
        markerFile.expectedHeader.gb_name = markerFile.expectedCSV.name;
    }
    else {
        markerFile.expectedHeader.gb_col = markerFile.expectedCSV.name;
        markerFile.expectedHeader.gb_name = markerFile.expectedCSV.group;
    }

    if (!markerFile.expectedRadios)
        markerFile.expectedRadios = {}
    if (markerFile.expectedCSV.piechart) {
        markerFile.expectedRadios.pie_check = true;
        markerFile.expectedHeader.pie_col = markerFile.expectedCSV.piechart
    } else {markerFile.expectedRadios.pie_check = false;}
    if (markerFile.expectedCSV.color) {
        markerFile.expectedRadios.cb_gr = false;
        markerFile.expectedRadios.cb_col = true;
        markerFile.expectedHeader.cb_col = markerFile.expectedCSV.color
    } else {markerFile.expectedRadios.cb_col = false;}
    if (markerFile.expectedCSV.scale) {
        markerFile.expectedRadios.scale_check = true;
        markerFile.expectedHeader.scale_col = markerFile.expectedCSV.scale
    } else {markerFile.expectedRadios.scale_check = false;}
    if (!markerFile.uid)
        markerFile.uid = "uniquetab";
    markerFile.name = markerFile.title.replace("Download","");
    if (markerFile.settings) {
        markerFile.expectedRadios.cb_gr = true;
        markerFile.expectedRadios.cb_gr_dict = false;
        markerFile.expectedRadios.cb_gr_rand = false;
        markerFile.expectedRadios.cb_gr_key = true;
        for (setting of markerFile.settings) {
            //if (setting.module == "glUtils" && setting.function == "_globalMarkerScale")
            //    markerFile.expectedHeader.scale_factor = setting.value;
            if (setting.module == "markerUtils" && setting.function == "_selectedShape"){
                dictSymbol = {6:6}
                if (dictSymbol[setting.value]) setting.value = dictSymbol[setting.value];
                markerFile.expectedHeader.shape_fixed = markerUtils._symbolStrings[setting.value];
            }
            if (setting.module == "markerUtils" && setting.function == "_randomShape") {
                markerFile.expectedRadios.shape_fixed = !setting.value;
                if (!markerFile.expectedHeader.shape_fixed) {
                    markerFile.expectedHeader.shape_fixed = markerUtils._symbolStrings[2];
                }
            }
            if (setting.module == "markerUtils" && setting.function == "_colorsperkey") {
                markerFile.expectedRadios.cb_gr = true;
                markerFile.expectedRadios.cb_gr_rand = false;
                markerFile.expectedRadios.cb_gr_key = false;
                markerFile.expectedRadios.cb_gr_dict = true;
                markerFile.expectedHeader.cb_gr_dict = JSON.stringify(setting.value);
            }
            if (setting.module == "HTMLElementUtils" && setting.function == "_colorsperiter") {
                markerFile.expectedRadios.cb_gr = true;
                markerFile.expectedRadios.cb_gr_rand = false;
                markerFile.expectedRadios.cb_gr_key = false;
                markerFile.expectedRadios.cb_gr_dict = true;
                markerFile.expectedHeader.cb_gr_dict = JSON.stringify(setting.value);
            }
            if (setting.module == "glUtils" && setting.function == "_markerOpacity") {
                markerFile.expectedHeader.opacity = setting.value;
                setting.function = "_markerOpacityOld"
            }
            if (setting.module == "HTMLElementUtils" && setting.function == "_colorsperbarcode") {
                markerFile.expectedRadios.cb_gr = true;
                markerFile.expectedRadios.cb_gr_rand = false;
                markerFile.expectedRadios.cb_gr_key = false;
                markerFile.expectedRadios.cb_gr_dict = true;
                markerFile.expectedHeader.cb_gr_dict = JSON.stringify(setting.value);
            }
        }
    }
    delete markerFile.expectedCSV;
    markerFile["hideSettings"] = true;
}

/**
 * Given an array of layers, return the longest common path
 * @param {!Array<!layers>} strs
 * @returns {string}
 */
projectUtils.commonPath = function(strs) {
    let prefix = ""
    if(strs === null || strs.length === 0) return prefix

    for (let i=0; i < strs[0].tileSource.length; i++){ 
        const char = strs[0].tileSource[i] // loop through all characters of the very first string. 

        for (let j = 1; j < strs.length; j++){ 
            // loop through all other strings in the array
            if(strs[j].tileSource[i] !== char) {
                prefix = prefix.substring(0, prefix.lastIndexOf('/')+1);
                return prefix
            }
        }
        prefix = prefix + char
    }
    prefix = prefix.substring(0, prefix.lastIndexOf('/')+1);
    return prefix
}

/** Applying settings */
projectUtils.applySettings = function (settings) {
    if (settings) {
        settings.forEach(function(setting, i) {
            if (window[setting.module]) {
                if (typeof window[setting.module][setting.function]  === 'function') {
                    window[setting.module][setting.function](setting.value);
                }
                else {
                    window[setting.module][setting.function] = setting.value;
                }
            }
        });
    }
}

/** Adding marker legend in the upper left corner */
projectUtils.addLegend = function (htmlContent) {
    if (! htmlContent) {
        if (document.getElementById("markerLegend")) {
            document.getElementById("markerLegend").style.display= "none";
        }
        return;
    }
    var op = tmapp["object_prefix"];
    if (document.getElementById("markerLegend") == undefined) {
        var elt = document.createElement('div');
        elt.className = "px-1 mx-1 viewer-layer"
        elt.id = "markerLegend"
        elt.style.zIndex = "13";
        elt.style.left = "10px";
        elt.style.top = "10px";
        elt.style.padding = "5px";
        elt.style.overflowY = "auto";
        elt.style.maxHeight = "Calc(100vh - 245px)";
        tmapp[tmapp["object_prefix"] + "_viewer"].addControl(elt,{anchor: OpenSeadragon.ControlAnchor.TOP_LEFT});
    }
    elt = document.getElementById("markerLegend");
    elt.style.display="block";
    elt.innerHTML = htmlContent;
}
