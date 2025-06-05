// pages/index.tsx
import { useEffect, useRef, useState } from "react";
import { Tabs, Tab, Button, Stack } from "@mui/material";
import ProcessGrid, { ProcessGridRef } from "../components/ProcessGrid";

const mockData = {
    "Wafer Buy": {
        "3nm": [
            {
                id: 1,
                product: "Chip A",
                quantity: 100,
                year: {
                    "2025": { pgPrice: 520, propPrice: 510 },
                    "2026": { pgPrice: 520, propPrice: 450 },
                },
                isSelected: false,
            },
            {
                id: 2,
                product: "Chip B",
                quantity: 200,
                year: {
                    "2025": { pgPrice: 500, propPrice: 495 },
                },
                isSelected: false,
            },
        ],
        "5nm": [
            {
                id: 3,
                product: "Chip C",
                quantity: 300,
                year: {
                    "2024": { pgPrice: 480, propPrice: 470 },
                    "2026": { pgPrice: 470, propPrice: 460 },
                },
                isSelected: false,
            },
        ],
        "7nm": [],
    },
    Misc: {
        "3nm": [
            {
                id: 4,
                product: "Misc A",
                quantity: 20,
                year: {
                    "2025": { pgPrice: 110, propPrice: 105 },
                },
                isSelected: false,
            },
        ],
        "10nm": [],
        "22nm": [
            {
                id: 5,
                product: "Misc B",
                quantity: 5,
                year: {
                    "2023": { pgPrice: 210, propPrice: 205 },
                },
                isSelected: false,
            },
        ],
    },
};

export default function Home() {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => setIsClient(true), []);

    const categories = Object.keys(mockData);
    const [mainTab, setMainTab] = useState(0);
    const [subTab, setSubTab] = useState(0);

    const currentCategory = categories[mainTab];
    const processNodes = Object.keys(mockData[currentCategory]);
    const currentNode = processNodes[subTab];
    const rowData = mockData[currentCategory][currentNode];

    const gridRef = useRef<ProcessGridRef>(null);

    const handlePrintSelected = () => {
        const selected = gridRef.current?.getSelectedRows?.() || [];
        console.log("✅ 勾選的資料：", selected);
    };

    const handleExportAll = () => {
        console.log("📦 匯出所有資料：", mockData);
    };

    return (
        <div style={{ padding: 24 }}>
            <Tabs
                value={mainTab}
                onChange={(e, v) => {
                    setMainTab(v);
                    setSubTab(0);
                }}
            >
                {categories.map((c) => (
                    <Tab key={c} label={c} />
                ))}
            </Tabs>

            <Tabs
                value={subTab}
                onChange={(e, v) => setSubTab(v)}
                style={{ marginTop: 12 }}
            >
                {processNodes.map((node) => (
                    <Tab key={node} label={node} />
                ))}
            </Tabs>

            <div style={{ marginTop: 16 }}>
                {!isClient ? null : rowData.length === 0 ? (
                    <div>無資料</div>
                ) : (
                    <>
                        <ProcessGrid ref={gridRef} rowData={rowData} />
                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                onClick={handlePrintSelected}
                            >
                                印出選取資料
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleExportAll}
                            >
                                匯出所有資料
                            </Button>
                        </Stack>
                    </>
                )}
            </div>
        </div>
    );
}
