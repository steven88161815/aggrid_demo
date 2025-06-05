// components/ProcessGrid.tsx
import {
    useRef,
    useImperativeHandle,
    forwardRef,
    useMemo,
    useEffect,
} from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export type YearlyData = {
    [year: string]: {
        pgPrice: number;
        propPrice: number;
    };
};

export type RowData = {
    id: number;
    product: string;
    quantity: number;
    year: YearlyData;
    isSelected: boolean;
};

type ProcessGridProps = {
    rowData: RowData[];
};

export type ProcessGridRef = {
    getSelectedRows: () => RowData[];
};

const ProcessGrid = forwardRef<ProcessGridRef, ProcessGridProps>(
    ({ rowData }, ref) => {
        const gridRef = useRef<any>(null);

        const allYears = useMemo(() => {
            const years = new Set<string>();
            rowData.forEach((row) => {
                Object.keys(row.year).forEach((y) => years.add(y));
            });
            return Array.from(years).sort();
        }, [rowData]);

        const columnDefs = useMemo(() => {
            const baseCols = [
                {
                    headerCheckboxSelection: true,
                    checkboxSelection: true,
                    width: 50,
                    pinned: "left",
                },
                { field: "id" },
                { field: "product" },
                { field: "quantity" },
            ];

            const yearCols = allYears.map((year) => ({
                headerName: year,
                children: [
                    {
                        headerName: "pgPrice",
                        field: `year.${year}.pgPrice`,
                        editable: false,
                    },
                    {
                        headerName: "propPrice",
                        field: `year.${year}.propPrice`,
                        editable: true,
                    },
                ],
            }));

            return [...baseCols, ...yearCols];
        }, [allYears]);

        useImperativeHandle(ref, () => ({
            getSelectedRows: () => {
                const selectedNodes =
                    gridRef.current?.api?.getSelectedNodes?.() || [];
                return selectedNodes.map((node: any) => node.data);
            },
        }));

        const handleCellValueChanged = (params: any) => {
            if (params.colDef.field?.includes("propPrice")) {
                const newValue = params.newValue;
                const oldValue = params.oldValue;
                if (isNaN(newValue) || Number(newValue) < 0) {
                    params.node.setDataValue(params.colDef.field, oldValue);
                    toast.error("請輸入有效的 propPrice（必須為非負數）");
                }
            }
        };

        // ✅ 同步資料中的 isSelected 狀態為勾選狀態
        const handleSelectionChanged = () => {
            const api = gridRef.current?.api;
            if (!api) return;
            api.forEachNode((node: any) => {
                node.data.isSelected = node.isSelected();
            });
        };

        // ✅ 載入表格後自動勾選 isSelected = true 的資料
        useEffect(() => {
            const api = gridRef.current?.api;
            if (!api) return;
            api.forEachNode((node: any) => {
                if (node.data.isSelected) {
                    node.setSelected(true);
                }
            });
        }, [rowData]);

        return (
            <>
                <div
                    className="ag-theme-alpine"
                    style={{ height: 400, width: "100%" }}
                >
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        rowSelection="multiple"
                        suppressRowClickSelection={true}
                        onCellValueChanged={handleCellValueChanged}
                        onSelectionChanged={handleSelectionChanged}
                    />
                </div>
            </>
        );
    }
);

export default ProcessGrid;
