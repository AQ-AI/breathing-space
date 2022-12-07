function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else
    {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
        end = dc.length;
        }
    }
    console.log(decodeURI(dc.substring(begin + prefix.length, end)));
    return decodeURI(dc.substring(begin + prefix.length, end));
} 

window.onload = function() {
    var myCookie = getCookie("ReportForm");
    var reportModal = document.getElementById("reportFormTutorial1");
    if (myCookie == "Visited") {
        // do cookie exists stuff
        console.log("cookie exists");
        reportModal.style.display = "none";
        // var modal = bootstrap.Modal.getInstance(reportModal);
        // modal.hide();
    }
    else {
        // do cookie doesn't exist stuff;
        console.log("cookie does not exist");
        reportModal.style.display = "show";
    }
}

//do not show button checked
var element = document.getElementById('reportCache');
element.addEventListener("click", function() {
    if(document.getElementById('flexCheckChecked').checked) {
        //add cookie 
        document.cookie = "ReportForm=Visited; Binary=1; expires=Thu, 18 Dec 9999 12:00:00 UTC; path=/";
        console.log("checkbox checked");
    } else {
        console.log("checkbox not checked");
        document.cookie = "ReportForm=; Binary=0; expires=Thu, 18 Dec 9999 12:00:00 UTC; path=/";
    }
});

