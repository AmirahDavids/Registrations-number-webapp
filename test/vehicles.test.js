const assert = require("assert");
const Factory = require('../registration')
const pg = require("pg");


const connectionString = process.env.DATABASE_URL || 'postgresql://amirah:coder123@localhost:5432/registration_db_test';


const Pool = pg.Pool;

const pool = new Pool({
    connectionString
});

const factory = Factory(pool);

beforeEach(async function () {
    await pool.query("delete from vehicles");
});

describe("The addRegToDatabase function", function () {

    it("should add single registration to database", async function () {
        await factory.addRegToDatabase("CA 123 456");
        const results = await pool.query("select * from vehicles");
        assert.strictEqual(1, results.rowCount);
    });

    it("should add multiple registrations to database", async function () {
        await factory.addRegToDatabase("CA 123 456");
        await factory.addRegToDatabase("CJ 123 700");
        await factory.addRegToDatabase("CY 123 456");
        await factory.addRegToDatabase("CA 121 111");
        await factory.addRegToDatabase("CY 000 456");
        await factory.addRegToDatabase("CY 123 000");
        const results = await pool.query("select * from vehicles");
        assert.strictEqual(results.rowCount, 6);
    });

});


describe("The getAllRegFromDatabase function", function () {

    it("should get  registration from database", async function () {
        await factory.addRegToDatabase("CA 123 456");

        var expected = [{
            "registration": "CA 123 456"
        }]


        const actual = await factory.getAllRegFromDatabase();
        assert.deepStrictEqual(actual, expected);
    });

    // it("should add multiple registrations to database", async function () {
    //     await factory.addRegToDatabase("CA 123 456");
    //     await factory.addRegToDatabase("CJ 123 700");
    //     await factory.addRegToDatabase("CY 123 456");
    //     await factory.addRegToDatabase("CA 121 111");
    //     await factory.addRegToDatabase("CY 000 456");
    //     await factory.addRegToDatabase("CY 123 000");
    //     const results = await pool.query("select * from vehicles");
    //     assert.equal(results.rowCount, 6);
    // });

});



after(function () {
    pool.end();
})