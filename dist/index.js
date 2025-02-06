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
const express_1 = __importDefault(require("express"));
const database_1 = require("./config/database");
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const otpRoutes_1 = __importDefault(require("./routes/otpRoutes"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const twilio_1 = __importDefault(require("twilio"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
dotenv_1.default.config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;
if (!accountSid || !authToken || !serviceSid) {
    throw new Error("Twilio credentials or service SID are missing.");
}
const client = (0, twilio_1.default)(accountSid, authToken);
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true, // Allow cookies to be sent
}));
// app.get('/', (req, res) => {
//     res.json({message: "Hello World!"})
// })
app.post('/reportDetails', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reportNumber, mobileNumber, otp } = req.body;
    if (!reportNumber || !mobileNumber || !otp) {
        res.status(400).json({ error: "All fields are required!" });
        return;
    }
    try {
        // verify otp
        const verificationCheck = yield client.verify.v2.services(serviceSid)
            .verificationChecks
            .create({ to: mobileNumber, code: otp });
        if (!verificationCheck.valid) {
            res.status(400).json({ error: 'Invalid or expired OTP' });
            return;
        }
        // const record = await prisma.oTP.findUnique({
        //     where: {
        //         mobileNumber
        //     }
        // })
        // if (!record || record.otp !== otp || new Date().toISOString() > record?.expiry) {
        //     res.status(400).json({error: 'Invalid or expired OTP'});
        //     return;
        // }
        // find report in db
        let report;
        if (reportNumber.startsWith('G')) {
            report = yield database_1.prisma.gemReport.findUnique({
                where: {
                    reportNumber
                }
            });
        }
        else if (reportNumber.startsWith('R')) {
            report = yield database_1.prisma.rudrakshaReport.findUnique({
                where: {
                    reportNumber
                }
            });
        }
        if (!report) {
            // console.log("Report not found, Please enter valid Report Number");
            res.status(404).json({ error: "Report not found, Please enter valid Report Number" });
            return;
        }
        res.status(200).json(report);
        return;
    }
    catch (error) {
        console.log("errrror ho gya re baba");
        console.log(error);
        res.status(500).json({ error: "An error occured" });
        return;
    }
}));
// Admin routes
app.use('/admin', adminRoutes_1.default);
app.use('/otp', otpRoutes_1.default);
app.listen(3000, () => {
    console.log("App is  listening at port 3000");
});
