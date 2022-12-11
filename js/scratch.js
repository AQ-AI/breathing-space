function draw_circle(canvas, size, color) {
    if (canvas.getContext) {
      const ctx = canvas.getContext("2d");
  
      ctx.beginPath();
      ctx.arc(25, 25, 20, 0, Math.PI * 2, true); // Outer circle
      ctx.stroke();
      ctx.fill();
    }
  }