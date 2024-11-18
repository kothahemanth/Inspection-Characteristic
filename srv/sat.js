const cds = require('@sap/cds');
const { create } = require('xmlbuilder2');
const axios = require('axios');

module.exports = cds.service.impl(async function () {
    const inspectionLots = await cds.connect.to('API_INSPECTIONLOT_SRV');
    const external = await cds.connect.to('USAGEDECISIONSELDCODESET_0001');
    const products = await cds.connect.to('API_PRODUCT_SRV');
    const longtxt = await cds.connect.to('YY1_INSPECTIONLOT_CDS_0001');

    this.on('READ', 'InspectionLot', async (req) => {
        return await inspectionLots.run(req.query);
    });

    this.on('READ', 'InspectionCharacteristic', async (req) => {
        return await inspectionLots.run(req.query);
    });

    this.on('READ', 'InspectionOperation', async (req) => {
        return await inspectionLots.run(req.query);
    });

    this.on('READ', 'InspectionResult', async (req) => {
        return await inspectionLots.run(req.query);
    });

    this.on('READ', 'InspectionResultValue', async (req) => {
        return await inspectionLots.run(req.query);
    });

    this.on('READ', 'InspectionUsageValue', async (req) => {
        return await inspectionLots.run(req.query);
    });

    this.on('READ', 'UsageDecisionSet', async (req) => {
        return await external.run(req.query);
    });

    this.on('READ', 'UsageDecisionCodeSet', async (req) => {
        return await external.run(req.query);
    });

    this.on('READ', 'ProductDescription', async (req) => {
        return await products.run(req.query);
    });

    this.on('READ', 'LongText', async (req) => {
        return await longtxt.run(req.query);
    });
    
    const { InspectionLot, codeset, Label} = this.entities;

    this.on('printForm', 'InspectionLot', async (req) => {
        try {
            const inspectionLotId = req.params[0].InspectionLot;
            console.log(`Fetching data for InspectionLot: ${inspectionLotId}`);
    
            const lotData = await inspectionLots.run(SELECT.from(InspectionLot).where({ InspectionLot: inspectionLotId }));
            if (!lotData.length) {
                req.error(404, `InspectionLot ${inspectionLotId} not found.`);
                return;
            }
    
            const charData = await inspectionLots.run(SELECT.from(this.entities.InspectionCharacteristic).where({ InspectionLot: inspectionLotId }));
            const opData = await inspectionLots.run(SELECT.from(this.entities.InspectionOperation).where({ InspectionLot: inspectionLotId }));
            const resData = await inspectionLots.run(SELECT.from(this.entities.InspectionResult).where({ InspectionLot: inspectionLotId }));
            const resValueData = await inspectionLots.run(SELECT.from(this.entities.InspectionResultValue).where({ InspectionLot: inspectionLotId }));
            const usagevalData = await inspectionLots.run(SELECT.from(this.entities.InspectionUsageValue).where({ InspectionLot: inspectionLotId }));
    
            const materials = [...new Set(lotData.map(lot => lot.Material))];
            let materialDescriptions = [];
            if (materials.length > 0) {
                materialDescriptions = await products.run(
                    SELECT.from(this.entities.material).where({
                        Product: { in: materials },
                        Language: 'EN'
                    })
                );
            }
    
            const selectedCodeSets = usagevalData.map(val => val.InspLotUsgeDcsnSelectedSet).filter(Boolean);
            let selectedCodeTexts = [];
            if (selectedCodeSets.length > 0) {
                selectedCodeTexts = await external.run(
                    SELECT.from(this.entities.codeset).where({
                        SelectedCodeSet: { in: selectedCodeSets },
                        Language: 'EN'
                    })
                );
            }
    
            let decisionCodeTexts = [];
            try {
                const decisionCodeFilter = usagevalData.map(val => ({
                    SelectedCodeSet: val.InspLotUsgeDcsnSelectedSet,
                    UsageDecisionCode: val.InspectionLotUsageDecisionCode
                })).filter(item => item.SelectedCodeSet && item.UsageDecisionCode);
    
                if (decisionCodeFilter.length > 0) {
                    decisionCodeTexts = await external.run(
                        SELECT.from(this.entities.decisioncodeset).where({
                            SelectedCodeSet: { in: decisionCodeFilter.map(f => f.SelectedCodeSet) },
                            UsageDecisionCode: { in: decisionCodeFilter.map(f => f.UsageDecisionCode) },
                            Language: 'EN'
                        })
                    );
                } else {
                    console.log("No valid filters for decisioncodeset query. Skipping fetch.");
                }
            } catch (error) {
                console.error("Error fetching decisioncodeset data:", error.message);
            }
    
            let longTexts = [];
            try {
                longTexts = await longtxt.run(
                    SELECT.from(this.entities.longtext).where({
                        InspectionLot: inspectionLotId,
                        Plant: lotData[0]?.Plant
                    })
                );
            } catch (error) {
                console.error("Error fetching longtext data:", error.message);
            }
    
            const structuredData = {
                InspectionLotNode: {
                    ...lotData[0],
                    MaterialDescription: materialDescriptions.find(desc => desc.Product === lotData[0].Material)?.ProductDescription || '',
                    InspectionOperations: opData.map(item => ({
                        ...item,
                        InspectionCharacteristics: charData.filter(char => char.InspPlanOperationInternalID === item.InspPlanOperationInternalID),
                        InspectionResults: resData.filter(res => res.InspPlanOperationInternalID === item.InspPlanOperationInternalID),
                        InspectionResultValues: resValueData.filter(val => val.InspPlanOperationInternalID === item.InspPlanOperationInternalID),
                        InspectionUsageValues: usagevalData
                            .filter(val => val.InspectionLot === item.InspectionLot)
                            .map(val => ({
                                ...val,
                                SelectedCodeSetText: selectedCodeTexts.find(
                                    code => code.SelectedCodeSet === val.InspLotUsgeDcsnSelectedSet
                                )?.SelectedCodeSetText || '',
                                UsageDecisionCodeText: decisionCodeTexts.find(
                                    code =>
                                        code.SelectedCodeSet === val.InspLotUsgeDcsnSelectedSet &&
                                        code.UsageDecisionCode === val.InspectionLotUsageDecisionCode
                                )?.UsageDecisionCodeText || '',
                                InspLotUsageDecisionLongText: longTexts.find(
                                    text =>
                                        text.InspectionLot === val.InspectionLot &&
                                        text.Plant === lotData[0]?.Plant
                                )?.InspLotUsageDecisionLongText || ''
                            }))
                    }))
                }
            };
    
            function ensureEmptyTags(obj) {
                if (Array.isArray(obj)) {
                    return obj.length === 0 ? {} : obj.map(ensureEmptyTags);
                } else if (typeof obj === 'object' && obj !== null) {
                    return Object.fromEntries(
                        Object.entries(obj).map(([key, value]) => [key, ensureEmptyTags(value)])
                    );
                }
                return obj;
            }
    
            let labelname = req.data.labelname;
            const updatedJsonData = ensureEmptyTags(structuredData);
            const xml = create(updatedJsonData).end({ prettyPrint: true });
            console.log("Generated XML:", xml);
            const base64Xml = Buffer.from(xml).toString('base64');
    
            try {
                const authResponse = await axios.get('https://chembonddev.authentication.us10.hana.ondemand.com/oauth/token', {
                    params: {
                        grant_type: 'client_credentials'
                    },
                    auth: {
                        username: 'sb-ffaa3ab1-4f00-428b-be0a-1ec55011116b!b142994|ads-xsappname!b65488',
                        password: 'e44adb92-4284-4c5f-8d41-66f8c1125bc5$F4bN1ypCgWzc8CsnjwOfT157HCu5WL0JVwHuiuwHcSc='
                    }
                });
                const accessToken = authResponse.data.access_token;
                const pdfResponse = await axios.post('https://adsrestapi-formsprocessing.cfapps.us10.hana.ondemand.com/v1/adsRender/pdf?templateSource=storageName', {
                    xdpTemplate: labelname,
                    xmlData: base64Xml,
                    formType: "print",
                    formLocale: "",
                    taggedPdf: 1,
                    embedFont: 0
                }, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                const fileContent = pdfResponse.data.fileContent;
                return fileContent;
    
            } catch (error) {
                console.error("Error occurred:", error);
                return req.error(500, "An error occurred while processing your request.");
            }    
        } catch (error) {
            console.error(`Error generating XML for InspectionLot ${req.params[0].InspectionLot}:`, error);
            req.error(500, `Error generating XML for InspectionLot ${req.params[0].InspectionLot}: ${error.message}`);
        }
    });    

    this.on('READ', Label, async (req) => {
        let Label = [
            { "Label": "hemanth/Default" },
            { "Label": "sumanth/Default" },
            { "Label": "annapurna/Default" },
        ];
        Label.$count = Label.length;
        return Label;
    });
})