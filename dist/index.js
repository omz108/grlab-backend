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
const app = (0, express_1.default)();
app.use(express_1.default.json());
// app.get('/', (req, res) => {
//     res.json({message: "Hello World!"})
// })
app.post('/getCertificate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reportNumber, mobileNumber, otp } = req.body;
    if (!reportNumber || !mobileNumber || !otp) {
        res.status(400).json({ error: "All fields are required!" });
        return;
    }
    try {
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
app.listen(3000, () => {
    console.log("App is  listening at port 3000");
});
