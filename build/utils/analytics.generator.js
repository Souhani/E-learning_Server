"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLast12MonthsData = void 0;
;
// genrate the last 12 months data  (you can write better one)
async function generateLast12MonthsData(module) {
    const last12Months = [];
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 1);
    for (let i = 12; i >= 1; i--) {
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 30 * i);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 30);
        const count = await module.countDocuments({
            createdAt: {
                $gte: startDate,
                $lt: endDate
            }
        });
        const monthYear = endDate.toLocaleString("default", {
            month: "short",
            year: "numeric"
        });
        last12Months.push({
            month: monthYear,
            count
        });
    }
    ;
    return { last12Months };
}
exports.generateLast12MonthsData = generateLast12MonthsData;
;
