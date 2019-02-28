var div = document.createElement("div");
div.setAttribute("id", "myform");
div.setAttribute("class", "fs-form fs-form-overview fs-show");

var ol = document.createElement('ol');
ol.setAttribute("class","fs-fields");

var fieldnames = [{'FLO data':'hey i wrote FLO data'},{'Type':'transfer'},{'Identification':'rmt#'},{'Amount':5000}]

for (var i=0; i<fieldnames.length; i++){
    var item= document.createElement('li');
    var label = document.createElement('label');
    label.setAttribute('class','fs-field-label fs-anim-upper');
    label.setAttribute('for','q'+ i.toString());
    label.innerHTML = Object.keys(fieldnames[i])[0]
    var input = document.createElement('input');
    input.setAttribute('class','fs-anim-lower');
    input.setAttribute("id",'q'+ i.toString());
    input.setAttribute("name",'q'+ i.toString());
    input.setAttribute("type","text");
    input.setAttribute("value",fieldnames[i][label.innerHTML]);
    item.appendChild(label)
    item.appendChild(input)
    ol.appendChild(item)
}

div.appendChild(ol)
document.body.appendChild(div);