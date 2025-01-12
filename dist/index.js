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
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
dotenv_1.default.config();
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
        const record = yield database_1.prisma.oTP.findUnique({
            where: {
                mobileNumber
            }
        });
        if (!record || record.otp !== otp || new Date().toISOString() > (record === null || record === void 0 ? void 0 : record.expiry)) {
            res.status(400).json({ error: 'Invalid or expired OTP' });
            return;
        }
        // find report in db
        const report = yield database_1.prisma.report.findUnique({
            where: {
                reportNumber
            }
        });
        if (!report) {
            // console.log("Report not found, Please enter valid Report Number");
            res.status(404).json({ error: "Report not found, Please enter valid Report Number" });
            return;
        }
        res.status(200).json(report);
        return;
    }
    catch (error) {
        // console.log("errrror ho gya re baba");
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
