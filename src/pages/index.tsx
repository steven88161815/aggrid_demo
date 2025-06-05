import { useEffect, useState } from "react";
import { Tabs, Tab, Button, Stack } from "@mui/material";
import ProcessGrid from "../components/ProcessGrid";

// ✅ 定義每一年份的價格型別
export type YearMap = Record<
    string,
    { pgPrice: number | null; propPrice: number }
>;

// ✅ 每一列的資料型別
export type RowData = {
    id: number;
    product: string;
    quantity: number;
    year: YearMap;
    isSelected: boolean; // 是否被勾選
};

// ✅ 整體資料結構：大分類 > 製程節點 > 資料列陣列
type MockDataType = Record<string, Record<string, RowData[]>>;

// ✅ 初始資料（假資料）
const initialMockData: MockDataType = {
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
        "5nm": [],
        "7nm": [],
    },
    Misc: {
        "3nm": [
            {
                id: 3,
                product: "Misc A",
                quantity: 20,
                year: {
                    "2024": { pgPrice: 110, propPrice: 105 },
                },
                isSelected: false,
            },
        ],
        "10nm": [],
        "22nm": [
            {
                id: 4,
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
    // ✅ 主狀態：mockData 包含所有資料內容（會被同步更新）
    const [mockData, setMockData] = useState<MockDataType>(initialMockData);

    // ✅ 控制目前的母 tab（如 Wafer Buy / Misc）
    const [mainTab, setMainTab] = useState(0);

    // ✅ 控制目前的子 tab（如 3nm / 5nm）
    const [subTab, setSubTab] = useState(0);

    // ✅ 現在母分類的名稱
    const categories = Object.keys(mockData);
    const currentCategory = categories[mainTab];

    // ✅ 該分類下的所有製程節點
    const processNodes = Object.keys(mockData[currentCategory]);
    const currentNode = processNodes[subTab];

    // ✅ 目前選定的列資料
    const rowData = mockData[currentCategory][currentNode];

    // ✅ 接收子元件傳回來的「打勾選取狀態」變化
    const handleSelectionChange = (updatedRows: RowData[]) => {
        const newData = structuredClone(mockData);
        updatedRows.forEach((row) => {
            const found = newData[currentCategory][currentNode].find(
                (r) => r.id === row.id
            );
            if (found) {
                found.isSelected = row.isSelected;
            }
        });
        setMockData(newData); // ✅ 更新狀態
    };

    // ✅ 接收子元件編輯欄位後的更新，更新對應的年份資料
    const handleDataChange = (changedRows: RowData[]) => {
        const updated = structuredClone(mockData);
        const targetRows = updated[currentCategory][currentNode];

        changedRows.forEach((changed) => {
            const found = targetRows.find((r) => r.id === changed.id);
            if (found) {
                found.year = changed.year;
            }
        });

        setMockData(updated);
    };

    // ✅ 印出目前 tab 下有勾選的資料
    const handlePrintSelected = () => {
        const selected = rowData.filter((r) => r.isSelected);
        console.log("✅ 勾選的資料：", selected);
    };

    // ✅ 匯出全部 mockData（含所有 tab）
    const handleExportAll = () => {
        console.log("📦 匯出所有資料：", mockData);
    };

    return (
        <div style={{ padding: 24 }}>
            {/* 母分類 Tabs（Wafer Buy / Misc） */}
            <Tabs
                value={mainTab}
                onChange={(e, v) => {
                    setMainTab(v);
                    setSubTab(0); // 母 tab 切換時，子 tab 重置為第 0 個
                }}
            >
                {categories.map((c) => (
                    <Tab key={c} label={c} />
                ))}
            </Tabs>

            {/* 子分類 Tabs（3nm / 5nm 等） */}
            <Tabs
                value={subTab}
                onChange={(e, v) => setSubTab(v)}
                style={{ marginTop: 12 }}
            >
                {processNodes.map((node) => (
                    <Tab key={node} label={node} />
                ))}
            </Tabs>

            {/* 表格與按鈕列 */}
            <div style={{ marginTop: 16 }}>
                {rowData.length === 0 ? (
                    <div>無資料</div>
                ) : (
                    <>
                        <ProcessGrid
                            rowData={rowData}
                            onSelectionChange={handleSelectionChange}
                            onDataChange={handleDataChange}
                        />
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
