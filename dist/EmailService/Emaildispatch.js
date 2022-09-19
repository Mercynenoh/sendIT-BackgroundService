"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ejs_1 = __importDefault(require("ejs"));
const mssql_1 = __importDefault(require("mssql"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = require("../Config/config");
dotenv_1.default.config();
const Email_1 = __importDefault(require("../Helpers/Email"));
const dbhelper_1 = __importDefault(require("../Helper/dbhelper"));
const db = new dbhelper_1.default();
const SendEmail = () => __awaiter(void 0, void 0, void 0, function* () {
    const pool = yield mssql_1.default.connect(config_1.sqlConfig);
    const parcels = yield (yield pool.request().query(`
    SELECT * FROM Parcels WHERE issent=0`)).recordset;
    // const pool = await mssql.connect(sqlConfig)
    //  const parcels:Parcel[]= await (await db.exec("parceldispatched")).recordset
    for (let parcel of parcels) {
        ejs_1.default.renderFile('template/dispatchreceiver.ejs', { email: parcel.RecepientEmail, parcel: `${parcel.parcelname} and parcel name is ${parcel.parcelname}` }, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
            let messageoption = {
                from: process.env.EMAIL,
                to: parcel.RecepientEmail,
                subject: "Parcel Dispatched!!",
                html: data,
                attachments: [
                    {
                        filename: 'parcel.txt',
                        content: `Your Parcel : '${parcel.parcelname}' has been dispatched  from, '${parcel.Adress}'`
                    }
                ]
            };
            try {
                yield (0, Email_1.default)(messageoption);
                yield db.exec("updateSent", { id: parcel.id });
                // await pool.request().query(`UPDATE Parcels SET 
                // issent=1 WHERE id='${parcel.id}'`)
            }
            catch (error) {
                console.log(error);
            }
        }));
        ejs_1.default.renderFile('template/dispatchreceiver.ejs', { email: parcel.Senderemail, parcel: `${parcel.parcelname} and parcel name is ${parcel.parcelname}` }, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
            let messageoption = {
                from: process.env.EMAIL,
                to: parcel.Senderemail,
                subject: "Parcel Dispatched!!",
                html: data,
                attachments: [
                    {
                        filename: 'parcel.txt',
                        content: `Your Parcel : '${parcel.parcelname}' has been dispatched from, '${parcel.Adress}'`
                    }
                ]
            };
            try {
                yield (0, Email_1.default)(messageoption);
                yield db.exec("updateSent", { id: parcel.id });
                console.log('Sent');
            }
            catch (error) {
                console.log(error);
            }
        }));
    }
});
exports.default = SendEmail;
