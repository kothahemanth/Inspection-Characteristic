sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/ui/core/HTML"
], function(MessageToast, JSONModel, Dialog, Button, HTML) {
    'use strict';

    return {
        printForm: function(oBindingContext, aSelectedContexts) {
            console.log(aSelectedContexts);
            let mParameters = {
                contexts: aSelectedContexts[0],
                label: 'Confirm',
                invocationGrouping: true    
            };
            this.editFlow.invokeAction('InspectionService.printForm', mParameters)
                .then(function(result) {
                    let base64PDF = result.getObject().value;  
                    console.log(base64PDF);
                    const byteCharacters = atob(base64PDF);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }   
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'application/pdf' });
                    const pdfUrl = URL.createObjectURL(blob);

                    // Directly display PDF in the dialog without any input box
                    const oHtml = new HTML({
                        content: `<iframe src="${pdfUrl}" width="100%" height="500px"></iframe>`
                    });

                    let oDialog = new Dialog({
                        title: 'Generated PDF',
                        contentWidth: "600px",
                        contentHeight: "500px",
                        verticalScrolling: true,
                        content: oHtml,
                        buttons: [
                            new Button({
                                text: 'Download',
                                press: function () {
                                    const link = document.createElement('a');
                                    link.href = pdfUrl;
                                    link.download = 'generated_pdf.pdf'; 
                                    link.click();  
                                }
                            }),
                            new Button({
                                text: 'Close',
                                press: function () {
                                    oDialog.close();
                                }
                            })
                        ],
                        afterClose: function() {
                            oDialog.destroy();
                        }
                    });

                    oDialog.open();
                    
                })
        }
    };
});