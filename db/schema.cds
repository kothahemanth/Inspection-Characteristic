namespace com.satinfotech.inspection;
using {managed,cuid} from '@sap/cds/common';

@cds.persistence.skip
entity Label {

      @title: 'Label'
      key Label : String(80);

}