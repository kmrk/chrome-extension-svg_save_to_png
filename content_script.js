//content script
var el;

document.addEventListener("mousedown", function(event){
  el = event.target;
}, true);

function copyStylesInline(destinationNode, sourceNode) {
  var containerElements = ["svg","g"];
  for (var cd = 0; cd < destinationNode.childNodes.length; cd++) {
      var child = destinationNode.childNodes[cd];
      if (containerElements.indexOf(child.tagName) != -1) {
           copyStylesInline(child, sourceNode.childNodes[cd]);
           continue;
      }
      var style = sourceNode.childNodes[cd].currentStyle || window.getComputedStyle(sourceNode.childNodes[cd]);
      if (style == "undefined" || style == null) continue;
      for (var st = 0; st < style.length; st++){
           child.style.setProperty(style[st], style.getPropertyValue(style[st]));
      }
  }
}

function triggerDownload (imgURI, fileName) {
 var evt = new MouseEvent("click", {
   view: window,
   bubbles: false,
   cancelable: true
 });
 var a = document.createElement("a");
 a.setAttribute("download", fileName);
 a.setAttribute("href", imgURI);
 a.setAttribute("target", '_blank');
 a.dispatchEvent(evt);
}

function downloadSvg(svg, fileName) {
 var copy = svg.cloneNode(true);
 copyStylesInline(copy, svg);
 var canvas = document.createElement("canvas");
 var bbox = svg.getBBox();
 canvas.id="svgsave_temp_canvase"
 canvas.width = bbox.width;
 canvas.height = bbox.height;
 var ctx = canvas.getContext("2d");
 ctx.clearRect(0, 0, bbox.width, bbox.height);
 var data = (new XMLSerializer()).serializeToString(copy);
 var DOMURL = window.URL || window.webkitURL || window;
 var img = new Image();
 var svgBlob = new Blob([data], {type: "image/svg+xml;charset=utf-8"});
 var url = DOMURL.createObjectURL(svgBlob);
 fileName = fileName+"-"+canvas.width+"x"+canvas.height+".png";
 img.onload = function () {
   ctx.drawImage(img, 0, 0);
   DOMURL.revokeObjectURL(url);
   var imgURI = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
   triggerDownload(imgURI, fileName);
 };
 img.src = url;
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(el.tagName==="path"){
    el = el.parentNode;
  }
  // console.log(el);
  if(el.tagName==="svg") downloadSvg(el,Date.now())
  else alert("the selection "+el.tagName+" is not a svg")
  }
);
