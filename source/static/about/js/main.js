$(document).ready(function (){
    initTerm();
});

function initTerm() {
    this.term = rTerm({
        height: 600,
        chartime: 100,
        username: "guest",
        hostname: "82flex.com",
        file: "main.json"
    });
};
