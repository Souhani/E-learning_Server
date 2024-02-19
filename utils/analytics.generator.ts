import { Document, Model } from "mongoose";

interface MonthData {
    month: string;
    count: number;
};

// genrate the last 12 months data  (you can write better one)
export async function generateLast12MonthsData<T extends Document>(
    module: Model<T>
): Promise<{ last12Months: MonthData[]}> {
 const last12Months: MonthData[] = [];
 const currentDate = new Date();
 currentDate.setDate(currentDate.getDate() + 1);
 
 for(let i=12; i>=1; i--) {
   const startDate = new Date (
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate() - 30 * i
   );
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
   })
 };
 return { last12Months };
};

