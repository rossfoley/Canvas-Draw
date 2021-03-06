var canvas = document.getElementById("draw_canvas"),
    ctx = canvas.getContext("2d"),
    tools_section = $("#tools a"),
    commands_section = $("#commands a"),
    filters_section = $("#filters a"),
    styling_section = $("#styling_options"),
    toolStarted = false,
    firstClickCoord,
    backgroundCanvasPixels,
    active_tool;

$(document).ready(function() {
  var jquery_canvas = $("#draw_canvas");
  active_tool = line;

  $("#styling_options input[name='fill_color']").blur(function() {
    ctx.fillStyle = $(this).val();
  });

  $("#styling_options input[name='stroke_color']").blur(function() {
    ctx.strokeStyle = $(this).val();
  });

  $("#styling_options input[name='line_width']").bind("change", function() {
    ctx.lineWidth = parseInt($(this).val());
    $(this).siblings("#line_width").html($(this).val());
  });

  initializeCanvasStyles();

  tools_section.click(toolClicked);
  commands_section.click(commandClicked);
  filters_section.click(filterClicked);

  jquery_canvas.click(clickOnCanvas)
  jquery_canvas.mousemove(mouseMovedOnCanvas);
});

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

var filters = {
  invert: function(pixel) {
    var newPixel = pixel;

    for (var i = 0; i < 3; i++) {
      newPixel[i] = 255 - newPixel[i];
    }
    return newPixel;
  },
  grayscale: function(pixel) {
    var newPixel = pixel,
        intensity = 0.2989*pixel[0] + 0.5870*pixel[1] + 0.1140*pixel[2];

    for (var i = 0; i < 3; i++) {
      newPixel[i] = intensity;
    }
    return newPixel;
  }
};

function toolClicked(e) {
  tools_section.removeClass("active_tool");
  $(this).addClass("active_tool");
  toolStarted = false;

  switch ($(this).attr("id")) {
    case "line":
      active_tool = line;
      break;

    case "rectangle":
      active_tool = rectangle;
      break;

    case "circle":
      active_tool = circle;
      break;
  }
  return false;
}

function commandClicked(e) {
  switch ($(this).attr("id")) {
    case "clear_canvas":
      if (confirm("Are you sure you want to clear the canvas?"))
        clearCanvas();
      break;

    case "save_image":
      window.location = ctx.canvas.toDataURL('image/png');
      break;
  }
  return false;
}

function filterClicked(e) {
  switch ($(this).attr("id")) {
    case "invert_pixels":
      applyFilterToCanvas(filters.invert);
      break;
    case "grayscale":
      applyFilterToCanvas(filters.grayscale);
      break;
  }
  return false;
}

function applyFilterToCanvas(filterFunction) {
  var canvasPixels = ctx.getImageData(0, 0, canvas.width, canvas.height),
      pixelArray = canvasPixels.data;
  
  for (var i = 0; i < pixelArray.length; i += 4) {
    var newPixel = filterFunction([pixelArray[i], pixelArray[i+1], pixelArray[i+2], pixelArray[i+3]]);

    for (var j = 0; j < 4; j++) {
      pixelArray[i+j] = newPixel[j];
    }
  }

  ctx.putImageData(canvasPixels, 0, 0);
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

function initializeCanvasStyles() {
  $("#styling_options input").blur().trigger("change");
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
