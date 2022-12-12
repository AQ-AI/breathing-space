// $("[data-toggle='toggle']").click(function() {
//     var selector = $(this).data("target");
//     $(selector).toggleClass('in');
// });

function toggleLegend() {
    var legend = document.getElementById("legend");
    var legendCollapse = document.getElementById("legend-collapse");
    if (legend.style.display === "none") {
      legend.style.display = "block";
      legendCollapse.innerHTML = "Hide Legend";
      legendCollapse.style.backgroundColor = "black";
      legendCollapse.style.color= "white";
    } else {
      legend.style.display = "none";
      legendCollapse.innerHTML = "Show Legend";
      legendCollapse.style.backgroundColor = "black";
      legendCollapse.style.color= "white";
    }
  }