import Data from "../../dist/data.json";
import MapV1 from "../../.map/v1.json";

export default class DataUtil {
    static getKeyByValue(object, value) {
        for(let prop in object) {
            if(object.hasOwnProperty(prop)) {
                 if(object[prop] === value) {
                    return prop;
                 }
            }
        }

        return "0";
    }

    static data() {
        return Data;
    }

    static stringMap(version = 1) {
        switch(version) {
            case 1: return MapV1;
        }

        return null;
    }
}