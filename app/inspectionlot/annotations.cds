using InspectionService as service from '../../srv/sat';
annotate service.InspectionLot with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'InspectionLot',
                Value : InspectionLot,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Material',
                Value : Material,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Batch',
                Value : Batch,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Plant',
                Value : Plant,
            },
            {
                $Type : 'UI.DataField',
                Label : 'InspectionLotOrigin',
                Value : InspectionLotOrigin,
            },
            {
                $Type : 'UI.DataField',
                Label : 'GoodsMovementType',
                Value : GoodsMovementType,
            },
            {
                $Type : 'UI.DataField',
                Label : 'SalesOrder',
                Value : SalesOrder,
            },
            {
                $Type : 'UI.DataField',
                Label : 'SalesOrderItem',
                Value : SalesOrderItem,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Language',
                Value : Language,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'InspectionLot',
            Value : InspectionLot,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Material',
            Value : Material,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Batch',
            Value : Batch,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Plant',
            Value : Plant,
        },
        {
            $Type : 'UI.DataField',
            Label : 'InspectionLotOrigin',
            Value : InspectionLotOrigin,
        },
    ],
);

