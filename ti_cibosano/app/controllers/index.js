var syncProcess = require("SyncProcess");
$.syncButton.addEventListener('click', function() {
    syncProcess.execute({
        success: function() {
            alert("SUCCESS SYNC");
        },
        error: function() {
            alert("ERROR SYNC");
        }
    });
});

var puntiVendita = require("ListaPuntiVendita");
puntiVendita.init({
    done: function() {
        Alloy.createController('dashboard').getView().open();
        require('NetworkSafeAction').executeWithoutAlert(function(){
            puntiVendita.sync();
        });
    }
});


