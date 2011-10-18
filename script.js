var canvas = document.getElementById("draw_canvas"),
    ctx = canvas.getContext("2d"),
    toolStarted = false,
    firstClickCoord,
    backgroundCanvasPixels,
    tools = $("#tools_section a");

var line = {
  name: "Line Tool",
  draw: function(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
};

var rectangle = {
  name: "Rectangle Tool",
  draw: function(x1, y1, x2, y2) {
    var start_x = Math.min(x1, x2),
        start_y = Math.min(y1, y2),
        rect_width = Math.abs(x1-x2),
        rect_height = Math.abs(y1-y2);
    ctx.strokeRect(start_x, start_y, rect_width, rect_height);
  }
};

var circle = {
  name: "Circle Tool",
  draw: function(x1, y1, x2, y2) {
    var radius = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, Math.PI*2, true);
    ctx.stroke();
  }
};

var active_tool = line;

$(window).ready(function() {
  var jquery_canvas = $("#draw_canvas");
  setCanvasStyles();
  tools.click(toolClicked);
  jquery_canvas.click(clickOnCanvas)
  jquery_canvas.mousemove(mouseMovedOnCanvas);
});

function toolClicked(e) {
  var previous_tool = $(".active_tool");
  tools.removeClass("active_tool");
  $(this).addClass("active_tool");
  toolStarted = false;

  switch (e.target.id) {
    case "line":
      active_tool = line;
      break;

    case "rectangle":
      active_tool = rectangle;
      break;

    case "circle":
      active_tool = circle;
      break;

    case "clear_canvas":
      if (confirm("Are you sure you want to clear the canvas?")) {
        clearCanvas();
        $(this).removeClass("active_tool");
        previous_tool.addClass("active_tool");
      }
      break;

    case "save_image":
      window.location = ctx.canvas.toDataURL('image/png');
      $(this).removeClass("active_tool");
      previous_tool.addClass("active_tool");
      break;
  }
}

function mouseMovedOnCanvas(e) {
  var clickCoord = getCursorPosition(e);
  if (toolStarted) {
    clearAndDrawTool(clickCoord);
  }
}

function clickOnCanvas(e) {
  var clickCoord = getCursorPosition(e);
  if (!toolStarted) {
    toolStarted = true;
    firstClickCoord = clickCoord;
    backgroundCanvasPixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  } else {
    toolStarted = false;
    clearAndDrawTool(clickCoord)
  }
}

function clearAndDrawTool(clickCoord) {
  clearCanvas();
  ctx.putImageData(backgroundCanvasPixels, 0, 0);
  active_tool.draw(firstClickCoord.x, firstClickCoord.y, clickCoord.x, clickCoord.y);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function setCanvasStyles() {
  ctx.strokeStyle = "#00f";
  ctx.lineWidth = 2;
}

function getCursorPosition(e) {
  var x, y, coord;
  if (e.pageX != undefined && e.pageY != undefined) {
    x = e.pageX;
    y = e.pageY;
  } else {
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;
  coord = { x: x, y: y };
  return coord;
}
