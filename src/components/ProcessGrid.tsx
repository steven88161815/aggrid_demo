import { useMemo, useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { RowData } from "../pages";
import { toast } from "react-toastify";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// ✅ 傳入元件的 props 型別
type Props = {
    rowData: RowData[]; // 表格的資料列
    onSelectionChange?: (updated: RowData[]) => void; // 勾選變化時通知父層
    onDataChange?: (updated: RowData[]) => void; // 編輯資料時通知父層
};

export default function ProcessGrid({
    rowData,
    onSelectionChange,
    onDataChange,
}: Props) {
    // ✅ 存 grid API 和 column API（方便後續操作）
    const [gridApi, setGridApi] = useState<any>(null);
    const [columnApi, setColumnApi] = useState<any>(null);

    // ✅ 取得所有出現過的年份（合併欄位用）
    const yearSet = useMemo(() => {
        const set = new Set<string>();
        rowData.forEach((r) => Object.keys(r.year).forEach((y) => set.add(y)));
        return Array.from(set).sort(); // 排序後傳出
    }, [rowData]);

    // ✅ 定義欄位（動態生成年份欄位）
    const columnDefs = useMemo(() => {
        const baseCols = [
            {
                headerCheckboxSelection: true, // 首欄支援全選框
                checkboxSelection: true, // 勾選欄位
                width: 50,
                pinned: "left", // 固定在最左側
            },
            { field: "id" },
            { field: "product" },
            { field: "quantity" },
        ];

        // ✅ 每個年份產出一組子欄（pgPrice / propPrice）
        const yearCols = yearSet.map((year) => ({
            headerName: year,
            children: [
                {
                    headerName: "pgPrice",
                    field: `year.${year}.pgPrice`,
                    editable: false, // 只讀
                },
                {
                    headerName: "propPrice",
                    field: `year.${year}.propPrice`,
                    editable: true, // 可編輯
                },
            ],
        }));

        return [...baseCols, ...yearCols];
    }, [yearSet]);

    // ✅ Grid 初始化後取得 API（由 onGridReady 提供）
    const handleGridReady = (params: any) => {
        setGridApi(params.api);
        setColumnApi(params.columnApi);
    };

    // ✅ 處理儲存格編輯事件
    const handleCellEdit = (params: any) => {
        const val = params.newValue;

        // 針對 propPrice 欄位驗證數值有效性
        if (params.colDef.field?.includes("propPrice")) {
            const isValid = !isNaN(val) && Number(val) >= 0;
            if (!isValid) {
                toast.error("請輸入有效的 propPrice（必須為非負數）");
                params.node.setDataValue(params.colDef.field, params.oldValue); // 還原舊值
                return;
            }
        }

        const updated = params.data;
        onDataChange?.([updated]); // 通知父層有資料變更
    };

    // ✅ 當選取狀態變更時，將 isSelected 狀態回寫到對應資料
    const handleSelectionChanged = () => {
        if (!gridApi) return;

        const selectedNodes = gridApi.getSelectedNodes();
        const updated = rowData.map((row) => ({
            ...row,
            isSelected: selectedNodes.some((n: any) => n.data.id === row.id),
        }));

        onSelectionChange?.(updated); // 通知父層更新選取狀態
    };

    // ✅ 每次資料列重新載入時，自動勾選 isSelected 為 true 的資料
    useEffect(() => {
        if (!gridApi) return;

        setTimeout(() => {
            gridApi.forEachNode((node: any) => {
                node.setSelected(!!node.data?.isSelected);
            });
        }, 0); // 確保在 render 之後再執行
    }, [rowData, gridApi]);

    return (
        <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
            <AgGridReact
                rowData={rowData} // 表格資料列
                columnDefs={columnDefs} // 表格欄位
                rowSelection="multiple" // 多選模式
                suppressRowClickSelection={true} // 禁止點整行就選取
                onGridReady={handleGridReady} // 初始取得 API
                onCellValueChanged={handleCellEdit} // 編輯事件
                onSelectionChanged={handleSelectionChanged} // 勾選事件
            />
        </div>
    );
}
