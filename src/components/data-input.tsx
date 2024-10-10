'use client';
import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { LoaderIcon } from "lucide-react";

export function DataInput() {
    const [periodes, setPeriodes] = useState<string>("2");
    const [data, setData] = useState<Array<{ spending: number; income: number }>>([{ spending: 0, income: 0 }, { spending: 0, income: 0 }]);
    const [isLoading, setIsLoading] = useState(false);
    const [irrValue, setIrrValue] = useState<{ value: number, error: string | null } | null>(null);


    const handlePeriodesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        setPeriodes(newValue);

        let newPeriodes = 2
        if (/^\d*\.?\d*$/.test(newValue)) {
            newPeriodes = Math.max(2, Number(newValue));
        }
        if (newPeriodes > data.length) {
            // Add new entries
            const additionalEntries = Array.from({ length: newPeriodes - data.length }, () => ({
                spending: 0,
                income: 0
            }));
            setData(prev => [...prev, ...additionalEntries]);
        } else if (newPeriodes < data.length) {
            // Slice the data array to the new number of periods
            setData(prev => prev.slice(0, newPeriodes));
        }
    };

    function handleChangeCell(newValue: string, row: number, cell: number) {
        // Validate input for spending/income to be a valid number
        if (/^\d*\.?\d*$/.test(newValue)) {
            const value = Number(newValue);
            setData(prev => {
                const newData = [...prev];
                if (cell === 0) {
                    newData[row].spending = value;
                } else {
                    newData[row].income = value;
                }
                return newData;
            });
        }
    }

    async function getIRR() {
        setIsLoading(true);
        try {
            const response = await fetch('https://api-irr.vercel.app/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    spending: data.map(item => item.spending),
                    income: data.map(item => item.income),
                    code: "resolve"
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log(result);
            if (result.status === 0) {
                setIrrValue({
                    value: result.irr,
                    error: null
                })
            } else {
                setIrrValue({
                    value: 0,
                    error: 'Nilai IRR tidak ditemukan.'
                })
            }
        } catch (error) {
            console.error(error)
            setIrrValue({
                value: 0,
                error: 'Error: gagal mendapatkan respons dari server.'
            });
        }
        setIsLoading(false);
    }

    return (
        <section className="container flex flex-col items-center">
            <div className="m-2">
                <Label htmlFor="number-of-row">Jumlah periode</Label>
                <Input
                    id="number-of-row"
                    className="w-[250px] max-w-[90%]"
                    type="number"
                    inputMode="numeric"
                    min={2}
                    value={periodes}
                    onChange={handlePeriodesChange}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr>
                            <th className="p-2 text-left">Tahun</th>
                            <th className="p-2 text-center">Konstribusi</th>
                            <th className="p-2 text-center">Keuntungan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td className="p-2 text-left">{index}</td>
                                <td className="p-2">
                                    <Input
                                        type="text" // Change to text to allow decimal input
                                        inputMode="decimal" // Change inputMode to decimal for mobile keyboards
                                        value={item.spending}
                                        onChange={(e) => handleChangeCell(e.target.value, index, 0)}
                                        placeholder="Spending"
                                        className="text-right w-full" // Align text to the right and full width
                                    />
                                </td>
                                <td className="p-2">
                                    <Input
                                        type="text" // Change to text to allow decimal input
                                        inputMode="decimal" // Change inputMode to decimal for mobile keyboards
                                        value={item.income}
                                        onChange={(e) => handleChangeCell(e.target.value, index, 1)}
                                        placeholder="Income"
                                        className="text-right w-full" // Align text to the right and full width
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-center my-2">
                <Button onClick={getIRR} className="bg-blue-700 text-white rounded-full hover:bg-blue-600 font-rubik font-normal inline-flex gap-2">
                    {
                        isLoading && <LoaderIcon className="animate-spin" />
                    }
                    Tentukan IRR
                </Button>
            </div>
            {
                irrValue && !isLoading &&
                <div className="my-2">
                    {
                        irrValue.error ? <p className="text-red-500">{irrValue.error}</p> :
                            <div className="flex gap-3 items-center">
                                <Label className="text-center text-nowrap">IRR =</Label>
                                <p className="text-center px-3 py-1 border rounded-lg">{`${irrValue.value} %`}</p>
                            </div>
                    }
                </div>
            }
        </section>
    );
}
