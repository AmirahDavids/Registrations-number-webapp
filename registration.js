module.exports = function Factory(pool) {

    async function getRegList() {
        var queryResult = await pool.query("select registration, place_id from vehicles");
        return queryResult.rows;
    }

    function getCode(plate) {
        return plate.split(" ")[0].toUpperCase()
    }

    function formatPlate(plate) {

        var code = plate.split(" ")[0].toUpperCase();

        var regNumber = plate.split(" ")[1].replace(/-/g, );

        var formattedPlate = "";
        var length = regNumber.length;

        for (let i = 0; i < regNumber.length; i++) {
            let character = regNumber[i];
            if (length == 6 && i == 3) {
                formattedPlate += "-";
            }
            formattedPlate += character;
        }

        return code + " " + formattedPlate.toUpperCase();
    }

    function validateReg(plate) {
        if (plate.split(" ").length > 1) {
            var validCharacters = /^[\w -]+$/;
            if (plate.match(validCharacters)) {
                return true;
            }
        }
        return false
    }

   async function filterByTown(loc) {


        var regList = await getRegList();

        if (loc == "") {
            return regList;
        }
        var list = []
        for (var i = 0; i < regList.length; i++) {

            var placeId = regList[i]["place_id"];



            if (placeId == loc) {
                list.push(regList[i]);
            }


        }
        return list;
    }

    async function getAllRegFromDatabase() {
        var results = await pool.query("select registrations from vehicles");
        return results.rows;
    }

    async function addRegToDatabase(plate) {
        var result = await pool.query("select id from places where code=$1", [getCode(plate)]);
        var id = result.rows[0]["id"];
        if (id > 0) {
            var doesExist = await pool.query("select * from vehicles where registration=$1", [plate]);
            if (doesExist.rows.length < 1) {
                await pool.query("insert into vehicles (registration, place_id) values ($1,$2)", [plate.toUpperCase(), id]);
                return true;
            }
        }
        return false;

    }

    async function clearDatabase() {
        await pool.query("delete from vehicles");
    }


    async function listOfPlaces() {
        let places = await pool.query('select * from places');
        return places.rows;
    }

    return {
        getRegList,
        listOfPlaces,
        validateReg,
        filterByTown,
        getCode,
        formatPlate,
        clearDatabase,
        addRegToDatabase,
        getAllRegFromDatabase
    }
}