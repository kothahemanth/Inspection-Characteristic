sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'inspectionlot/test/integration/FirstJourney',
		'inspectionlot/test/integration/pages/InspectionLotList',
		'inspectionlot/test/integration/pages/InspectionLotObjectPage'
    ],
    function(JourneyRunner, opaJourney, InspectionLotList, InspectionLotObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('inspectionlot') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheInspectionLotList: InspectionLotList,
					onTheInspectionLotObjectPage: InspectionLotObjectPage
                }
            },
            opaJourney.run
        );
    }
);